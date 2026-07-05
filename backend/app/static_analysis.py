import re
from typing import List, Dict, Any

class StaticAnalyzer:
    @staticmethod
    def analyze_solidity(source_code: str) -> List[Dict[str, Any]]:
        """
        Runs heuristics matching across 7 primary Solidity vulnerabilities.
        Returns a list of structured findings.
        """
        findings = []
        lines = source_code.split("\n")

        # 1. Reentrancy check
        # Looks for low-level call followed by state updates, or call without reentrancy guard
        reentrancy_pattern = re.compile(r"\.call\s*\{.*\}|msg\.sender\.call")
        state_update_pattern = re.compile(r"balances\[.*\]\s*=|\w+\s*\+=\s*\w+|\w+\s*-=\s*\w+")
        
        has_guard = "nonReentrant" in source_code or "ReentrancyGuard" in source_code

        # 2. Access Control issues
        # Check for functions modifying critical state variables without access modifiers
        owner_modifier_pattern = re.compile(r"function\s+\w+\s*\(.*\)\s+(external|public)")
        
        # 3. Delegatecall Abuse
        delegatecall_pattern = re.compile(r"\.delegatecall\s*\(")

        # 4. Timestamp Dependency
        timestamp_pattern = re.compile(r"block\.timestamp|now")

        # 5. Unchecked Calls
        # Check for .call() where return value is not assigned or validated
        unchecked_pattern = re.compile(r"\.call\s*\(.*[^;]\s*(?!require|if|bool ok)")

        # 6. Selfdestruct Vulnerability
        selfdestruct_pattern = re.compile(r"selfdestruct\s*\(|suicide\s*\(")

        # Scan code lines
        for idx, line in enumerate(lines):
            line_no = idx + 1
            stripped_line = line.strip()

            # Skip comments
            if stripped_line.startswith("//") or stripped_line.startswith("/*") or stripped_line.startswith("*"):
                continue

            # Check Reentrancy
            if reentrancy_pattern.search(stripped_line) and not has_guard:
                # Look ahead for state changes
                is_vulnerable = False
                for look_idx in range(line_no, min(line_no + 6, len(lines))):
                    if state_update_pattern.search(lines[look_idx]):
                        is_vulnerable = True
                        break
                if is_vulnerable:
                    findings.append({
                        "vulnerability": "Reentrancy candidate",
                        "description": "State updates occur after external low-level transfer call without ReentrancyGuard.",
                        "severity": "CRITICAL",
                        "line": line_no,
                        "code_snippet": stripped_line
                    })

            # Check Delegatecall
            if delegatecall_pattern.search(stripped_line):
                findings.append({
                    "vulnerability": "Delegatecall Abuse risk",
                    "description": "Using delegatecall preserves msg.sender and context. Ensure target contract is immutable/whitelisted.",
                    "severity": "HIGH",
                    "line": line_no,
                    "code_snippet": stripped_line
                })

            # Check Selfdestruct
            if selfdestruct_pattern.search(stripped_line):
                findings.append({
                    "vulnerability": "Selfdestruct Vulnerability",
                    "description": "Unchecked selfdestruct allows malicious drainage / contract termination.",
                    "severity": "HIGH",
                    "line": line_no,
                    "code_snippet": stripped_line
                })

            # Check Timestamp dependency
            if timestamp_pattern.search(stripped_line):
                findings.append({
                    "vulnerability": "Timestamp Dependency",
                    "description": "Block timestamp can be manipulated by miners. Avoid using it for critical randomness or exact timers.",
                    "severity": "LOW",
                    "line": line_no,
                    "code_snippet": stripped_line
                })

            # Check Unchecked call
            if ".call" in stripped_line and not any(x in stripped_line for x in ["bool", "require", "assert", "if"]):
                findings.append({
                    "vulnerability": "Unchecked Call return value",
                    "description": "The return value of external call is ignored. Transactions can fail silently.",
                    "severity": "MEDIUM",
                    "line": line_no,
                    "code_snippet": stripped_line
                })

        # 7. Integer Overflow check (for solidity version <0.8.0 without SafeMath)
        version_match = re.search(r"pragma\s+solidity\s+([^;]+);", source_code)
        if version_match:
            version_str = version_match.group(1).strip()
            # If version is less than 0.8.0 and SafeMath is not imported
            if any(v in version_str for v in ["0.7.", "0.6.", "0.5.", "0.4."]) and "SafeMath" not in source_code:
                findings.append({
                    "vulnerability": "Integer Overflow/Underflow potential",
                    "description": "Solidity compiler version < 0.8.0 does not check for arithmetic overflows/underflows by default.",
                    "severity": "MEDIUM",
                    "line": 1,
                    "code_snippet": version_match.group(0)
                })

        # Access Control heuristic: public functions containing critical state update commands
        state_update_count = 0
        has_owner_check = any(x in source_code for x in ["onlyOwner", "require(msg.sender", "require(owner", "require(msg.sender == owner"])
        if not has_owner_check:
            for idx, line in enumerate(lines):
                stripped = line.strip()
                if "owner =" in stripped or "selfdestruct(" in stripped:
                    findings.append({
                        "vulnerability": "Access Control issue",
                        "description": "Critical parameters modified without owner authorization controls.",
                        "severity": "HIGH",
                        "line": idx + 1,
                        "code_snippet": stripped
                    })

        return findings
