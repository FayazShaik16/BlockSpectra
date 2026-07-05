import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class WalletAnalyzer:
    """
    Behavioral analysis engine for wallet intelligence.
    Runs heuristic checks on normalized wallet data to detect:
    - Whale behavior
    - Dormant wallets
    - Wash trading patterns
    - Suspicious activity
    - Approval risks
    """

    @staticmethod
    def analyze(wallet_data: Dict[str, Any], chain: str) -> Dict[str, Any]:
        """
        Run all heuristic analyzers and return composite results.
        Returns: {behavior_flags, wallet_score, risk_level, ...}
        """
        flags: List[str] = []
        risk_signals: List[Dict[str, Any]] = []

        # 1. Whale Detection
        whale_result = WalletAnalyzer._check_whale(wallet_data)
        if whale_result:
            flags.append("whale")
            risk_signals.append(whale_result)

        # 2. Dormant Wallet Detection
        dormant_result = WalletAnalyzer._check_dormant(wallet_data)
        if dormant_result:
            flags.append("dormant")
            risk_signals.append(dormant_result)

        # 3. Wash Trading Detection
        wash_result = WalletAnalyzer._check_wash_trading(wallet_data)
        if wash_result:
            flags.append("wash_trader")
            risk_signals.append(wash_result)

        # 4. Suspicious Activity Detection
        suspicious_result = WalletAnalyzer._check_suspicious(wallet_data)
        if suspicious_result:
            flags.append("suspicious")
            risk_signals.append(suspicious_result)

        # 5. Approval Risk Analysis
        approval_result = WalletAnalyzer._check_approvals(wallet_data)
        if approval_result:
            flags.append("risky_approvals")
            risk_signals.append(approval_result)

        # 6. High Frequency Trading Detection
        hft_result = WalletAnalyzer._check_high_frequency(wallet_data)
        if hft_result:
            flags.append("high_frequency")
            risk_signals.append(hft_result)

        # Calculate composite score
        wallet_score = WalletAnalyzer._calculate_score(flags, wallet_data)
        risk_level = WalletAnalyzer._score_to_level(wallet_score)

        return {
            "behavior_flags": flags,
            "risk_signals": risk_signals,
            "wallet_score": wallet_score,
            "risk_level": risk_level,
        }

    @staticmethod
    def _check_whale(data: Dict) -> Dict[str, Any] | None:
        """Flag if balance > $1M or single counterparty volume > $500K."""
        balance_usd = data.get("balance_usd", 0)
        token_value = sum(t.get("value_usd", 0) for t in data.get("tokens", []))
        total_value = balance_usd + token_value

        if total_value > 1_000_000:
            return {
                "flag": "whale",
                "severity": "INFO",
                "description": f"Wallet holds ${total_value:,.0f} in assets. Classified as a whale address.",
                "confidence": 95
            }

        # Check large single transfers
        for cp in data.get("counterparties", []):
            if cp.get("volume", 0) > 500_000:
                return {
                    "flag": "whale",
                    "severity": "INFO",
                    "description": f"Large transfer volume (${cp['volume']:,.0f}) detected with counterparty {cp['address'][:10]}...",
                    "confidence": 85
                }
        return None

    @staticmethod
    def _check_dormant(data: Dict) -> Dict[str, Any] | None:
        """Flag if no activity in 180+ days."""
        last_tx = data.get("last_tx_date")
        if not last_tx:
            return None

        try:
            last_dt = datetime.fromisoformat(last_tx.replace("Z", "+00:00")) if isinstance(last_tx, str) else last_tx
            days_inactive = (datetime.utcnow() - last_dt.replace(tzinfo=None)).days

            if days_inactive > 180:
                return {
                    "flag": "dormant",
                    "severity": "MEDIUM",
                    "description": f"Wallet has been dormant for {days_inactive} days. Last activity: {last_tx[:10]}.",
                    "confidence": 90
                }
        except Exception:
            pass
        return None

    @staticmethod
    def _check_wash_trading(data: Dict) -> Dict[str, Any] | None:
        """Detect circular transfers between the same addresses."""
        counterparties = data.get("counterparties", [])
        if len(counterparties) < 2:
            return None

        # Check for addresses that appear with very high tx counts relative to total
        tx_count = data.get("tx_count", 1)
        for cp in counterparties:
            ratio = cp.get("tx_count", 0) / max(tx_count, 1)
            if ratio > 0.4 and cp.get("tx_count", 0) > 20:
                return {
                    "flag": "wash_trader",
                    "severity": "HIGH",
                    "description": f"Concentrated trading: {ratio*100:.0f}% of all transactions are with address {cp['address'][:10]}... Possible wash trading pattern.",
                    "confidence": 75
                }
        return None

    @staticmethod
    def _check_suspicious(data: Dict) -> Dict[str, Any] | None:
        """Flag interaction with mixer-like patterns or dust attacks."""
        counterparties = data.get("counterparties", [])

        # Pattern: Many small-value counterparties (dust attack indicator)
        small_interactions = [cp for cp in counterparties if cp.get("volume", 0) < 1 and cp.get("tx_count", 0) > 5]
        if len(small_interactions) > 3:
            return {
                "flag": "suspicious",
                "severity": "HIGH",
                "description": f"Detected {len(small_interactions)} counterparties with micro-value high-frequency transfers. Possible dust attack or mixer relay pattern.",
                "confidence": 70
            }

        # Pattern: Known mixer/bridge label keywords
        mixer_keywords = ["tornado", "mixer", "blend", "wasabi", "samourai"]
        for cp in counterparties:
            label = (cp.get("label") or "").lower()
            if any(kw in label for kw in mixer_keywords):
                return {
                    "flag": "suspicious",
                    "severity": "CRITICAL",
                    "description": f"Interaction detected with known mixer/privacy service: {cp.get('label')}",
                    "confidence": 90
                }
        return None

    @staticmethod
    def _check_approvals(data: Dict) -> Dict[str, Any] | None:
        """Flag unlimited approvals to unverified contracts."""
        approvals = data.get("approvals", [])
        risky = [a for a in approvals if a.get("allowance") == "unlimited" or a.get("risk") == "HIGH"]

        if len(risky) > 0:
            return {
                "flag": "risky_approvals",
                "severity": "HIGH" if len(risky) > 2 else "MEDIUM",
                "description": f"{len(risky)} active token approval(s) with unlimited or high-risk allowance detected. Potential drain vector.",
                "confidence": 85
            }
        return None

    @staticmethod
    def _check_high_frequency(data: Dict) -> Dict[str, Any] | None:
        """Flag if tx frequency is unusually high (bot-like behavior)."""
        tx_count = data.get("tx_count", 0)
        first_tx = data.get("first_tx_date")
        last_tx = data.get("last_tx_date")

        if not first_tx or not last_tx or tx_count < 100:
            return None

        try:
            first_dt = datetime.fromisoformat(first_tx.replace("Z", "+00:00")) if isinstance(first_tx, str) else first_tx
            last_dt = datetime.fromisoformat(last_tx.replace("Z", "+00:00")) if isinstance(last_tx, str) else last_tx
            days = max((last_dt.replace(tzinfo=None) - first_dt.replace(tzinfo=None)).days, 1)
            daily_rate = tx_count / days

            if daily_rate > 50:
                return {
                    "flag": "high_frequency",
                    "severity": "MEDIUM",
                    "description": f"Extremely high transaction frequency: ~{daily_rate:.0f} txs/day over {days} days. Likely bot or automated trading.",
                    "confidence": 80
                }
        except Exception:
            pass
        return None

    @staticmethod
    def _calculate_score(flags: List[str], data: Dict) -> int:
        """
        Calculate composite wallet risk score (0-100).
        Higher = more risky.
        """
        score = 15  # Base score

        flag_weights = {
            "whale": 5,           # Whales aren't necessarily risky
            "dormant": 15,        # Dormant reactivation can be suspicious
            "wash_trader": 30,    # Wash trading is a strong red flag
            "suspicious": 35,     # Mixer interaction is critical
            "risky_approvals": 20,# Unlimited approvals are dangerous
            "high_frequency": 10, # Could be legitimate bot trading
        }

        for flag in flags:
            score += flag_weights.get(flag, 5)

        # Cap at 100
        return min(score, 100)

    @staticmethod
    def _score_to_level(score: int) -> str:
        if score >= 80:
            return "CRITICAL"
        elif score >= 60:
            return "HIGH"
        elif score >= 40:
            return "MEDIUM"
        elif score >= 20:
            return "LOW"
        else:
            return "SAFE"
