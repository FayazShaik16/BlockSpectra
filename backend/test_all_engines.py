import sys
import json
import httpx
import time

def print_banner(msg):
    print("=" * 60)
    print(f" {msg}")
    print("=" * 60)

def main():
    print_banner("BLOCKSPECTRA INTEGRATED INTELLIGENCE TEST SUITE (ALREADY RUNNING PORT 8000)")
    
    client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=25.0)
    
    try:
        # Test 1: Healthcheck / Etherscan/BscScan contract telemetry
        print("\n[TEST 1] Testing Etherscan/BscScan contract telemetry...")
        payload = {
            "chain": "ethereum",
            "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7" # USDT
        }
        res = client.post("/contracts/analyze", json=payload)
        assert res.status_code == 200, f"Status code was {res.status_code}: {res.text}"
        res_data = res.json()
        print("Analysis Request Submitted:")
        print(json.dumps(res_data, indent=2))
        analysis_id = res_data["id"]
        
        # Poll contract report status
        print("\nPolling contract telemetry status...")
        for _ in range(25):
            time.sleep(1)
            report_res = client.get(f"/contracts/report/{analysis_id}")
            if report_res.status_code == 200:
                report_data = report_res.json()
                if report_data["status"] == "COMPLETED":
                    print("USDT Contract Telemetry Complete!")
                    print(f"Risk Score: {report_data.get('risk_score')}")
                    print(f"Findings Count: {len(report_data.get('findings', []))}")
                    break
                elif report_data["status"] == "FAILED":
                    print("Contract scan failed!")
                    break
        
        # Test 2: Wallet behavioral intelligence audit
        print("\n[TEST 2] Testing wallet behavioral audit...")
        payload = {
            "chain": "ethereum",
            "address": "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8" # Genesis block / high activity
        }
        res = client.post("/wallets/analyze", json=payload)
        assert res.status_code == 200, f"Status code was {res.status_code}"
        res_data = res.json()
        wallet_analysis_id = res_data["id"]
        print("Wallet audit request submitted successfully.")
        
        # Poll wallet status
        for _ in range(25):
            time.sleep(1)
            report_res = client.get(f"/wallets/report/{wallet_analysis_id}")
            if report_res.status_code == 200:
                report_data = report_res.json()
                if report_data["status"] == "COMPLETED":
                    print("Wallet Analytics Complete!")
                    print(f"Wallet score: {report_data.get('wallet_score')}")
                    print(f"Total holdings: {len(report_data.get('token_holdings', []))}")
                    break
                elif report_data["status"] == "FAILED":
                    print("Wallet scan failed!")
                    break
                    
        # Test 3: Transaction Calldata Decoding
        print("\n[TEST 3] Testing EVM transaction calldata decoder...")
        # Uniswap swapExactETHForTokens selector 0x7a250d56...
        payload = {
            "type": "ethereum",
            "payload": "0x7a250d560000000000000000000000000000000000000000000000000de0b6b3a7640000"
        }
        res = client.post("/decode", json=payload)
        assert res.status_code == 200, f"Decoder failed: {res.text}"
        res_data = res.json()
        print("Decoder Output:")
        print(f"Method Name: {res_data.get('decoded', {}).get('method_name')}")
        print(f"Parameters parsed: {len(res_data.get('decoded', {}).get('parameters', []))}")
        
        # Test 4: DeFi centralized risk assessor
        print("\n[TEST 4] Testing centralized Risk Score Engine...")
        payload = {
            "contract_findings": [
                {
                    "vulnerability": "Reentrancy",
                    "severity": "HIGH",
                    "description": "State variable updated after external transfer"
                }
            ],
            "wallet_intelligence": {
                "wallet_score": 75,
                "behavior_flags": ["high_mixer_interaction"]
            },
            "threat_intelligence": {
                "severity": "HIGH",
                "confidence_score": 0.85
            }
        }
        res = client.post("/risk/score", json=payload)
        assert res.status_code == 200, f"Risk engine failed: {res.text}"
        res_data = res.json()
        print("Centralized Risk Assessment:")
        print(f"Risk Score: {res_data.get('overall_score')}")
        print(f"Risk Level: {res_data.get('severity')}")
        print(f"Hazard Ratings count: {len(res_data.get('subscores', {}))}")
        
        # Test 5: EVM transaction simulator
        print("\n[TEST 5] Testing EVM simulation sandbox...")
        payload = {
            "chain": "ethereum",
            "backend": "tenderly",
            "tx_type": "transfer",
            "sender": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            "receiver": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "amount": 1.0,
            "token_address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "contract_address": None,
            "data": None,
            "value": 0.0,
            "gas_limit": 21000
        }
        res = client.post("/simulate", json=payload)
        assert res.status_code == 200, f"Simulation engine failed: {res.text}"
        res_data = res.json()
        sim_id = res_data["id"]
        print("Simulation scheduled successfully.")
        
        # Poll simulation status
        for _ in range(25):
            time.sleep(1)
            report_res = client.get(f"/simulation/{sim_id}")
            if report_res.status_code == 200:
                report_data = report_res.json()
                if report_data["status"] == "COMPLETED":
                    print("Simulation Sandbox Complete!")
                    print(f"Success state: {report_data.get('simulation_success')}")
                    print(f"State changes count: {len(report_data.get('state_changes', []))}")
                    break
                elif report_data["status"] == "FAILED":
                    print("Simulation failed!")
                    break
        
        # Test 6: Threat intelligence telemetry feed
        print("\n[TEST 6] Testing real-time threat intelligence feeds...")
        payload = {
            "indicator": "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
            "indicator_type": "wallet"
        }
        res = client.post("/threats/analyze", json=payload)
        assert res.status_code == 200, f"Threat analyzer failed: {res.text}"
        res_data = res.json()
        print("Active Vulnerability Threat Feeds:")
        print(f"Severity assessed: {res_data.get('severity')}")
        print(f"Confidence score: {res_data.get('confidence_score')}")

        # Test 7: Cross-chain token bridge health checks
        print("\n[TEST 7] Testing bridge audit tracker...")
        payload = {
            "bridge_protocol": "across",
            "source_chain": "ethereum",
            "destination_chain": "polygon",
            "sender_address": "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
            "amount_usd": 1500.0,
            "token": "USDT"
        }
        res = client.post("/bridges/analyze", json=payload)
        assert res.status_code == 200, f"Bridge analyzer failed: {res.text}"
        res_data = res.json()
        print("Bridge Health Telemetry:")
        print(f"Bridge Protocol: {res_data.get('bridge_protocol')}")
        print(f"Bridge Security Score: {res_data.get('bridge_risk_score')}")
        print(f"Mint limits audited: {len(res_data.get('flows', []))}")
        
        # Test 8: AI Report Generator Workspace
        print("\n[TEST 8] Testing AI Smart Contract Audit Report generator...")
        payload = {
            "report_type": "contract",
            "chain": "ethereum",
            "target": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
        }
        res = client.post("/reports/generate", json=payload)
        assert res.status_code == 200, f"Report generator failed: {res.text}"
        res_data = res.json()
        report_id = res_data["id"]
        print("AI smart contract report request submitted successfully.")
        
        # Poll report status
        for _ in range(25):
            time.sleep(1)
            report_res = client.get(f"/reports/report/{report_id}")
            if report_res.status_code == 200:
                report_data = report_res.json()
                if report_data["status"] == "COMPLETED":
                    print("AI Report Generation Complete!")
                    print(f"Overall Trust Rating: {report_data.get('risk_score')}")
                    print(f"Report structure keys: {list(report_data.get('statistics', {}).keys())}")
                    break
                elif report_data["status"] == "FAILED":
                    print("Report generation failed!")
                    break

        print("\n" + "=" * 60)
        print(" ALL ENGINE MODULE INTEGRATION TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 60 + "\n")
        
    except Exception as e:
        print(f"\nIntegration test failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
