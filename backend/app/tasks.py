import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.models import ContractAnalysis
from app.data_providers.manager import get_contract_source
from app.static_analysis import StaticAnalyzer
from app.ai_generator import generate_ai_report

logger = logging.getLogger(__name__)

# Simple in-memory background worker queue mapping task execution states
# to avoid requiring Celery/Redis in non-containerized environments.
async def run_async_analysis_task(analysis_id: str):
    logger.info(f"Starting async scanning task: {analysis_id}")
    
    async with AsyncSessionLocal() as session:
        # Fetch analysis record
        db_analysis = await session.get(ContractAnalysis, analysis_id)
        if not db_analysis:
            logger.error(f"Task record not found: {analysis_id}")
            return
            
        db_analysis.status = "PROCESSING"
        await session.commit()
        
        try:
            # 1. Fetch smart contract source code
            source_res = await get_contract_source(db_analysis.chain, db_analysis.address)
            if not source_res:
                raise Exception("Contract source code not found or could not be retrieved.")
                
            contract_name, source_code = source_res
            db_analysis.contract_name = contract_name
            db_analysis.source_code = source_code
            
            # 2. Run heuristics scanner
            findings = StaticAnalyzer.analyze_solidity(source_code)
            db_analysis.findings = findings
            
            # Determine overall vulnerability metrics
            if findings:
                severities = [f["severity"] for f in findings]
                if "CRITICAL" in severities:
                    db_analysis.severity = "CRITICAL"
                    db_analysis.risk_score = 94
                elif "HIGH" in severities:
                    db_analysis.severity = "HIGH"
                    db_analysis.risk_score = 78
                elif "MEDIUM" in severities:
                    db_analysis.severity = "MEDIUM"
                    db_analysis.risk_score = 56
                elif "LOW" in severities:
                    db_analysis.override_severity = "LOW"
                    db_analysis.risk_score = 32
                else:
                    db_analysis.severity = "INFO"
                    db_analysis.risk_score = 14
            else:
                db_analysis.severity = "INFO"
                db_analysis.risk_score = 4
                
            # 3. Generate AI structured report summary
            ai_report = await generate_ai_report(contract_name, source_code, findings, db_analysis.chain)
            db_analysis.executive_summary = ai_report.get("executive_summary")
            db_analysis.attack_scenarios = ai_report.get("attack_scenarios")
            db_analysis.recommendations = ai_report.get("recommendations")
            
            # Form confidence score based on analysis depth
            db_analysis.confidence_score = 90 if findings else 80
            db_analysis.status = "COMPLETED"
            
            logger.info(f"Task completed successfully: {analysis_id}")
            
        except Exception as e:
            logger.error(f"Error executing analysis task: {e}")
            db_analysis.status = "FAILED"
            db_analysis.executive_summary = f"Error performing scan: {str(e)}"
            
        finally:
            await session.commit()
