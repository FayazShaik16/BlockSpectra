import uuid
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db, async_engine, Base
from app.models import ContractAnalysis, ContractTranslation
from app.schemas import AnalysisRequest, AnalysisReportResponse, HistoryListResponse, TranslateCardsRequest, TranslateFullRequest
from app.tasks import run_async_analysis_task
from app.wallet_models import WalletAnalysis
from app.wallet_schemas import WalletAnalysisRequest, WalletReportResponse, WalletHistoryListResponse
from app.wallet_tasks import run_wallet_analysis_task
from app.graph_models import GraphAnalysis
from app.graph_schemas import GraphBuildRequest, GraphReportResponse, GraphHistoryListResponse
from app.graph_tasks import run_graph_build_task
from app.simulation_models import TransactionSimulation
from app.simulation_schemas import SimulationRequest, SimulationReportResponse, SimulationHistoryResponse
from app.simulation_tasks import run_transaction_simulation_task
from app.config import settings
from app.decoder_schemas import DecodeRequest, DecodeResponse
from app.decoder_engine import DecoderEngine
from app.event_schemas import EventAnalysisRequest, EventAnalysisResponse
from app.event_intelligence import EventIntelligenceEngine
from app.threat_schemas import ThreatAnalysisRequest, ThreatAnalysisResponse
from app.threat_intelligence import ThreatIntelligenceEngine
from app.risk_schemas import RiskAnalysisRequest, RiskAnalysisResponse
from app.risk_engine import RiskEngine
from app.bridge_schemas import BridgeAnalysisRequest, BridgeAnalysisResponse
from app.bridge_intelligence import BridgeIntelligenceEngine
from app.agent_sessions import ChatSession, SessionManager
from app.agent_schemas import ChatRequest
from app.agent_engine import AgentEngine
from sse_starlette.sse import EventSourceResponse

from app.report_schemas import ReportGenerateRequest, ReportResponse, ReportHistoryResponse, RegenerateSectionRequest
from app.report_tasks import run_report_generation_task, regenerate_report_section
from app.models import AIReport


app = FastAPI(title=settings.APP_NAME)

# Enable CORS for direct frontend integration (React dashboard on port 5173/5174)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Sync DB models to sqlite/postgres on startup
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.post("/contracts/analyze", response_model=AnalysisReportResponse)
async def analyze_contract(
    request: AnalysisRequest, 
    background_tasks: BackgroundTasks, 
    db: AsyncSession = Depends(get_db)
):
    analysis_id = str(uuid.uuid4())
    
    # Store initial pending state in database
    db_analysis = ContractAnalysis(
        id=analysis_id,
        chain=request.chain.lower(),
        address=request.address,
        status="PENDING",
        findings=[],
        risk_score=0,
        confidence_score=0
    )
    db.add(db_analysis)
    await db.commit()
    await db.refresh(db_analysis)
    
    # Spawn asynchronous analyzer task in the background
    background_tasks.add_task(run_async_analysis_task, analysis_id)
    
    return db_analysis

@app.get("/contracts/report/{id}", response_model=AnalysisReportResponse)
async def get_report(id: str, lang: str = "en", level: str = "intermediate", db: AsyncSession = Depends(get_db)):
    db_analysis = await db.get(ContractAnalysis, id)
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Contract report not found")
    
    if db_analysis.status == "COMPLETED":
        target_lang = (lang or "en").strip()
        target_level = (level or "intermediate").strip().lower()
        
        # Determine if we need to call the rewrite engine
        needs_rewrite = target_lang.lower() not in ("en", "english", "") or target_level != "intermediate"
        
        if needs_rewrite:
            translation_id = f"{id}_{target_lang}_{target_level}"
            db_translation = await db.get(ContractTranslation, translation_id)
            if db_translation and db_translation.executive_summary:
                # Cache hit — override report fields
                db_analysis.executive_summary = db_translation.executive_summary
                db_analysis.attack_scenarios = db_translation.attack_scenarios
                db_analysis.recommendations = db_translation.recommendations
            else:
                # Cache miss or summary fields not yet populated — call AI rewriter
                orig_summary = db_analysis.executive_summary or ""
                orig_scenarios = db_analysis.attack_scenarios or ""
                orig_recs = db_analysis.recommendations or ""
                
                if orig_summary or orig_scenarios or orig_recs:
                    from app.translation_helper import translate_report_sections
                    translated = await translate_report_sections(
                        executive_summary=orig_summary,
                        attack_scenarios=orig_scenarios,
                        recommendations=orig_recs,
                        language=target_lang,
                        explanation_level=target_level
                    )
                    
                    if db_translation:
                        db_translation.executive_summary = translated.get("executive_summary")
                        db_translation.attack_scenarios = translated.get("attack_scenarios")
                        db_translation.recommendations = translated.get("recommendations")
                    else:
                        db_translation = ContractTranslation(
                            id=translation_id,
                            analysis_id=id,
                            language=target_lang,
                            explanation_level=target_level,
                            executive_summary=translated.get("executive_summary"),
                            attack_scenarios=translated.get("attack_scenarios"),
                            recommendations=translated.get("recommendations")
                        )
                        db.add(db_translation)
                    await db.commit()
                    
                    db_analysis.executive_summary = translated.get("executive_summary")
                    db_analysis.attack_scenarios = translated.get("attack_scenarios")
                    db_analysis.recommendations = translated.get("recommendations")
                    
    return db_analysis


@app.post("/contracts/report/{id}/translate-cards")
async def translate_report_cards(
    id: str,
    request: TranslateCardsRequest,
    db: AsyncSession = Depends(get_db)
):
    db_analysis = await db.get(ContractAnalysis, id)
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Contract report not found")
        
    target_lang = request.language.strip()
    target_level = request.explanation_level.strip().lower()
    
    is_english = target_lang.lower() in ("en", "english", "")
    
    # If English and intermediate, no translation is needed
    if is_english and target_level == "intermediate":
        return {"cards": request.cards}
        
    translation_id = f"{id}_{target_lang}_{target_level}"
    db_translation = await db.get(ContractTranslation, translation_id)
    
    if db_translation and db_translation.card_texts:
        # Cache hit
        return {"cards": db_translation.card_texts}
        
    # Cache miss - translate using OpenRouter
    from app.translation_helper import translate_cards
    translated_cards = await translate_cards(
        cards=request.cards,
        language=target_lang,
        explanation_level=target_level
    )
    
    if db_translation:
        db_translation.card_texts = translated_cards
    else:
        db_translation = ContractTranslation(
            id=translation_id,
            analysis_id=id,
            language=target_lang,
            explanation_level=target_level,
            card_texts=translated_cards
        )
        db.add(db_translation)
        
    await db.commit()
    return {"cards": translated_cards}


@app.post("/contracts/report/{id}/translate-full")
async def translate_report_full(
    id: str,
    request: TranslateFullRequest,
    db: AsyncSession = Depends(get_db)
):
    db_analysis = await db.get(ContractAnalysis, id)
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Contract report not found")
        
    target_lang = request.language.strip()
    target_level = request.explanation_level.strip().lower()
    
    is_english = target_lang.lower() in ("en", "english", "")
    
    # If English and intermediate, no translation is needed
    if is_english and target_level == "intermediate":
        return {"report_data": request.report_data}
        
    translation_id = f"{id}_{target_lang}_{target_level}"
    db_translation = await db.get(ContractTranslation, translation_id)
    
    if db_translation and db_translation.full_report_json:
        # Cache hit
        return {"report_data": db_translation.full_report_json}
        
    # Cache miss - translate using OpenRouter
    from app.translation_helper import translate_full_report
    translated_json = await translate_full_report(
        report_data=request.report_data,
        language=target_lang,
        explanation_level=target_level
    )
    
    if db_translation:
        db_translation.full_report_json = translated_json
    else:
        db_translation = ContractTranslation(
            id=translation_id,
            analysis_id=id,
            language=target_lang,
            explanation_level=target_level,
            full_report_json=translated_json
        )
        db.add(db_translation)
        
    await db.commit()
    return {"report_data": translated_json}


@app.get("/contracts/history", response_model=HistoryListResponse)
async def get_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ContractAnalysis).order_by(ContractAnalysis.created_at.desc()))
    analyses = result.scalars().all()
    return {"analyses": analyses}

# ─── Wallet Intelligence Endpoints ────────────────────────────────────────────

@app.post("/wallets/analyze", response_model=WalletReportResponse)
async def analyze_wallet(
    request: WalletAnalysisRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    analysis_id = str(uuid.uuid4())

    db_analysis = WalletAnalysis(
        id=analysis_id,
        chain=request.chain.lower(),
        address=request.address,
        status="PENDING",
        wallet_score=50,
        risk_level="UNKNOWN",
        total_balance_usd=0,
        token_holdings=[],
        nft_holdings=[],
        transaction_summary={},
        approvals=[],
        counterparties=[],
        behavior_flags=[],
    )
    db.add(db_analysis)
    await db.commit()
    await db.refresh(db_analysis)

    background_tasks.add_task(run_wallet_analysis_task, analysis_id)

    return db_analysis

@app.get("/wallets/report/{id}", response_model=WalletReportResponse)
async def get_wallet_report(id: str, db: AsyncSession = Depends(get_db)):
    db_analysis = await db.get(WalletAnalysis, id)
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Wallet report not found")
    return db_analysis

@app.get("/wallets/history", response_model=WalletHistoryListResponse)
async def get_wallet_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WalletAnalysis).order_by(WalletAnalysis.created_at.desc()))
    analyses = result.scalars().all()
    return {"analyses": analyses}

# ─── Cross-Chain Attack Graph Endpoints ────────────────────────────────────────

@app.post("/graph/build", response_model=GraphReportResponse)
async def build_attack_graph(
    request: GraphBuildRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    analysis_id = str(uuid.uuid4())

    db_analysis = GraphAnalysis(
        id=analysis_id,
        chain=request.chain.lower(),
        address=request.address,
        status="PENDING",
        nodes=[],
        edges=[],
        report={},
    )
    db.add(db_analysis)
    await db.commit()
    await db.refresh(db_analysis)

    background_tasks.add_task(run_graph_build_task, analysis_id)

    return db_analysis

@app.get("/graph/history", response_model=GraphHistoryListResponse)
async def get_graph_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GraphAnalysis).order_by(GraphAnalysis.created_at.desc()))
    analyses = result.scalars().all()
    return {"analyses": analyses}

@app.post("/simulate", response_model=SimulationReportResponse)
async def simulate_transaction(
    request: SimulationRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    sim_id = str(uuid.uuid4())
    
    db_sim = TransactionSimulation(
        id=sim_id,
        chain=request.chain.lower(),
        backend=request.backend.lower(),
        tx_type=request.tx_type.lower(),
        sender=request.sender,
        receiver=request.receiver,
        amount=request.amount,
        token_address=request.token_address,
        contract_address=request.contract_address,
        data=request.data,
        value=request.value,
        gas_limit=request.gas_limit,
        status="PENDING",
        simulation_success=True,
        execution_trace=[],
        state_changes=[],
        asset_changes=[],
        events=[],
        risk_analysis=[]
    )
    db.add(db_sim)
    await db.commit()
    await db.refresh(db_sim)
    
    background_tasks.add_task(run_transaction_simulation_task, sim_id)
    return db_sim

@app.get("/simulation/{id}", response_model=SimulationReportResponse)
async def get_simulation_report(id: str, db: AsyncSession = Depends(get_db)):
    db_sim = await db.get(TransactionSimulation, id)
    if not db_sim:
        raise HTTPException(status_code=404, detail="Transaction simulation not found")
    return db_sim

@app.get("/simulation/history", response_model=SimulationHistoryResponse)
async def get_simulation_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TransactionSimulation).order_by(TransactionSimulation.created_at.desc()))
    simulations = result.scalars().all()
    return {"simulations": simulations}

@app.get("/graph/{id}", response_model=GraphReportResponse)
async def get_graph_report(id: str, db: AsyncSession = Depends(get_db)):
    db_analysis = await db.get(GraphAnalysis, id)
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Graph report not found")
    return db_analysis

@app.post("/decode", response_model=DecodeResponse)
async def decode_payload(request: DecodeRequest):
    return await DecoderEngine.decode(request)

@app.post("/events/analyze", response_model=EventAnalysisResponse)
async def analyze_events(request: EventAnalysisRequest):
    return await EventIntelligenceEngine.analyze(request)

@app.post("/threats/analyze", response_model=ThreatAnalysisResponse)
async def analyze_threats(request: ThreatAnalysisRequest):
    return await ThreatIntelligenceEngine.analyze(request)

@app.post("/risk/score", response_model=RiskAnalysisResponse)
async def calculate_risk_score(request: RiskAnalysisRequest):
    return await RiskEngine.calculate(request)

@app.post("/bridges/analyze", response_model=BridgeAnalysisResponse)
async def analyze_bridges(request: BridgeAnalysisRequest):
    return await BridgeIntelligenceEngine.analyze(request)

@app.post("/agent/chat")
async def agent_chat(request: ChatRequest):
    return EventSourceResponse(AgentEngine.chat(request))

@app.get("/agent/history")
async def get_agent_history():
    sessions = await SessionManager.list_sessions()
    return {"sessions": sessions}

@app.get("/agent/history/{session_id}")
async def get_agent_session_history(session_id: str):
    history = await SessionManager.get_history(session_id)
    if not history:
        raise HTTPException(status_code=404, detail="Session not found")
    return history

# ─── Report Generator Workspace Endpoints ─────────────────────────────────────

@app.post("/reports/generate", response_model=ReportResponse)
async def generate_report(
    request: ReportGenerateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    report_id = str(uuid.uuid4())
    db_report = AIReport(
        id=report_id,
        report_type=request.report_type.lower(),
        chain=request.chain.lower(),
        target=request.target,
        status="PENDING",
        risk_score=0,
        confidence_score=0,
        severity="INFO",
        statistics={}
    )
    db.add(db_report)
    await db.commit()
    await db.refresh(db_report)
    
    background_tasks.add_task(run_report_generation_task, report_id)
    return db_report

@app.get("/reports/report/{id}", response_model=ReportResponse)
async def get_report_details(id: str, db: AsyncSession = Depends(get_db)):
    db_report = await db.get(AIReport, id)
    if not db_report:
        raise HTTPException(status_code=404, detail="AI report not found")
    return db_report

@app.get("/reports/history", response_model=ReportHistoryResponse)
async def get_report_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AIReport).order_by(AIReport.created_at.desc()))
    reports = result.scalars().all()
    return {"reports": reports}

@app.post("/reports/regenerate-section", response_model=ReportResponse)
async def regenerate_section(request: RegenerateSectionRequest, db: AsyncSession = Depends(get_db)):
    updated_content = await regenerate_report_section(request.report_id, request.section)
    if updated_content is None:
        raise HTTPException(status_code=404, detail="Report not found or invalid section")
    db_report = await db.get(AIReport, request.report_id)
    return db_report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)


