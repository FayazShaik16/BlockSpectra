import logging
import httpx
import json
import re
from typing import Dict, Any, List, Optional
from app.config import settings
from app.decoder_schemas import (
    DecodeRequest,
    DecodeResponse,
    DecodedData,
    DecodedParameter,
    DecodedEvent,
    DecodedOutput,
    AnalysisResult,
    AssetMovement,
    RiskDetail
)

logger = logging.getLogger(__name__)

# Common EVM Method Selectors lookup map
EVM_SELECTORS = {
    "a9059cbb": {"name": "transfer", "inputs": [{"name": "to", "type": "address"}, {"name": "value", "type": "uint256"}], "outputs": [{"name": "success", "type": "bool"}]},
    "095b1903": {"name": "approve", "inputs": [{"name": "spender", "type": "address"}, {"name": "value", "type": "uint256"}], "outputs": [{"name": "success", "type": "bool"}]},
    "23b872dd": {"name": "transferFrom", "inputs": [{"name": "from", "type": "address"}, {"name": "to", "type": "address"}, {"name": "value", "type": "uint256"}], "outputs": [{"name": "success", "type": "bool"}]},
    "70a08231": {"name": "balanceOf", "inputs": [{"name": "owner", "type": "address"}], "outputs": [{"name": "balance", "type": "uint256"}]},
    "3593564e": {"name": "execute", "inputs": [{"name": "target", "type": "address"}, {"name": "data", "type": "bytes"}, {"name": "value", "type": "uint256"}], "outputs": []},
    "7a250d56": {"name": "swapExactTokensForTokens", "inputs": [{"name": "amountIn", "type": "uint256"}, {"name": "amountOutMin", "type": "uint256"}, {"name": "path", "type": "address[]"}, {"name": "to", "type": "address"}, {"name": "deadline", "type": "uint256"}], "outputs": [{"name": "amounts", "type": "uint256[]"}]},
    "38ed5639": {"name": "swapExactTokensForTokens", "inputs": [{"name": "amountIn", "type": "uint256"}, {"name": "amountOutMin", "type": "uint256"}, {"name": "path", "type": "address[]"}, {"name": "to", "type": "address"}, {"name": "deadline", "type": "uint256"}], "outputs": [{"name": "amounts", "type": "uint256[]"}]},
    "880cd831": {"name": "swapExactETHForTokens", "inputs": [{"name": "amountOutMin", "type": "uint256"}, {"name": "path", "type": "address[]"}, {"name": "to", "type": "address"}, {"name": "deadline", "type": "uint256"}], "outputs": [{"name": "amounts", "type": "uint256[]"}]},
    "5c11d795": {"name": "swapExactTokensForETH", "inputs": [{"name": "amountIn", "type": "uint256"}, {"name": "amountOutMin", "type": "uint256"}, {"name": "path", "type": "address[]"}, {"name": "to", "type": "address"}, {"name": "deadline", "type": "uint256"}], "outputs": [{"name": "amounts", "type": "uint256[]"}]},
    "415565b0": {"name": "cleanQueue", "inputs": [], "outputs": []},
    "f242432a": {"name": "safeTransferFrom", "inputs": [{"name": "from", "type": "address"}, {"name": "to", "type": "address"}, {"name": "id", "type": "uint256"}, {"name": "amount", "type": "uint256"}, {"name": "data", "type": "bytes"}], "outputs": []},
}

# Common EVM Event Signatures lookup map
EVM_EVENTS = {
    "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
        "name": "Transfer",
        "inputs": [{"name": "from", "type": "address", "indexed": True}, {"name": "to", "type": "address", "indexed": True}, {"name": "value", "type": "uint256", "indexed": False}]
    },
    "8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {
        "name": "Approval",
        "inputs": [{"name": "owner", "type": "address", "indexed": True}, {"name": "spender", "type": "address", "indexed": True}, {"name": "value", "type": "uint256", "indexed": False}]
    }
}

# Bitcoin Opcode Map
BTC_OPCODES = {
    0x00: "OP_0",
    0x4f: "OP_1NEGATE",
    0x51: "OP_1",
    0x52: "OP_2",
    0x53: "OP_3",
    0x54: "OP_4",
    0x55: "OP_5",
    0x56: "OP_6",
    0x57: "OP_7",
    0x58: "OP_8",
    0x59: "OP_9",
    0x5a: "OP_10",
    0x5b: "OP_11",
    0x5c: "OP_12",
    0x5d: "OP_13",
    0x5e: "OP_14",
    0x5f: "OP_15",
    0x60: "OP_16",
    0x61: "OP_NOP",
    0x6a: "OP_RETURN",
    0x76: "OP_DUP",
    0x87: "OP_EQUAL",
    0x88: "OP_EQUALVERIFY",
    0xa7: "OP_RIPEMD160",
    0xa8: "OP_SHA256",
    0xa9: "OP_HASH160",
    0xaa: "OP_HASH256",
    0xac: "OP_CHECKSIG",
    0xad: "OP_CHECKSIGVERIFY",
    0xae: "OP_CHECKMULTISIG",
    0xaf: "OP_CHECKMULTISIGVERIFY",
    0xb0: "OP_CHECKLOCKTIMEVERIFY",
    0xb1: "OP_CHECKSEQUENCEVERIFY",
}

class DecoderEngine:
    @staticmethod
    def decode_base58(bc: str) -> bytes:
        BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
        n_pad = 0
        for char in bc:
            if char == '1':
                n_pad += 1
            else:
                break
        num = 0
        for char in bc:
            if char not in BASE58_ALPHABET:
                raise ValueError(f"Invalid character in base58 string: {char}")
            num = num * 58 + BASE58_ALPHABET.index(char)
        
        res = bytearray()
        while num > 0:
            res.append(num % 256)
            num //= 256
        return b'\x00' * n_pad + bytes(res[::-1])

    @staticmethod
    def parse_btc_script(script_bytes: bytes) -> List[str]:
        tokens = []
        i = 0
        n = len(script_bytes)
        while i < n:
            op = script_bytes[i]
            if 0x01 <= op <= 0x4b:  # Push data
                length = op
                i += 1
                data = script_bytes[i:i+length]
                tokens.append(data.hex())
                i += length
            elif op == 0x4c:  # OP_PUSHDATA1
                if i + 1 >= n: break
                length = script_bytes[i+1]
                i += 2
                data = script_bytes[i:i+length]
                tokens.append(data.hex())
                i += length
            elif op == 0x4d:  # OP_PUSHDATA2
                if i + 2 >= n: break
                length = int.from_bytes(script_bytes[i+1:i+3], 'little')
                i += 3
                data = script_bytes[i:i+length]
                tokens.append(data.hex())
                i += length
            elif op == 0x4e:  # OP_PUSHDATA4
                if i + 4 >= n: break
                length = int.from_bytes(script_bytes[i+1:i+5], 'little')
                i += 5
                data = script_bytes[i:i+length]
                tokens.append(data.hex())
                i += length
            else:
                opcode_name = BTC_OPCODES.get(op, f"OP_UNKNOWN_{op}")
                tokens.append(opcode_name)
                i += 1
        return tokens

    @classmethod
    def decode_ethereum(cls, payload: str, abi: Optional[Any], metadata: Optional[Dict[str, Any]]) -> DecodedData:
        # Clean prefix
        calldata = payload.strip()
        if calldata.startswith("0x"):
            calldata = calldata[2:]
        
        if len(calldata) < 8:
            return DecodedData(method_name="Fallback (No Selector)", parameters=[])
        
        selector = calldata[:8]
        args_hex = calldata[8:]
        
        method_name = f"unknown_{selector}"
        parameters = []
        outputs = []
        
        # Try to find standard selector
        method_def = EVM_SELECTORS.get(selector)
        
        # If user provided custom ABI, parse it to find matching signature
        if abi:
            try:
                if isinstance(abi, str):
                    abi_list = json.loads(abi)
                else:
                    abi_list = abi
                
                # Check if it is a list of methods
                if isinstance(abi_list, list):
                    for item in abi_list:
                        if item.get("type") == "function":
                            # Standard ABI item
                            # We will match based on argument types or name, or if they specify selector
                            # Simplest: if we can match selector or if there's only one function
                            name = item.get("name", "custom_function")
                            inputs_def = item.get("inputs", [])
                            # Let's count bytes vs arguments or just match
                            # Here we just select the one matching name or selector if we want,
                            # for simplicity, let's map inputs_def to this method
                            method_name = name
                            method_def = {"name": name, "inputs": inputs_def, "outputs": item.get("outputs", [])}
                            break
            except Exception as e:
                logger.error(f"Error parsing provided ABI: {e}")

        if method_def:
            method_name = method_def["name"]
            inputs = method_def["inputs"]
            # Decode parameters positionally
            offset = 0
            for idx, inp in enumerate(inputs):
                inp_type = inp.get("type", "uint256")
                inp_name = inp.get("name", f"param_{idx}")
                
                # Get the chunk
                chunk = args_hex[offset:offset+64]
                if not chunk:
                    break
                
                value = f"0x{chunk}"
                
                if "address" in inp_type:
                    value = "0x" + chunk[-40:]
                elif "uint" in inp_type:
                    try:
                        value = int(chunk, 16)
                    except ValueError:
                        value = f"0x{chunk}"
                elif "bool" in inp_type:
                    value = int(chunk, 16) != 0
                elif "string" in inp_type or "bytes" in inp_type:
                    # Strings/bytes are dynamic, their value in parameter list is the offset to data
                    try:
                        data_offset = int(chunk, 16) * 2 # offset in characters
                        # Read length of bytes
                        len_chunk = args_hex[data_offset:data_offset+64]
                        length = int(len_chunk, 16)
                        data_hex = args_hex[data_offset+64:data_offset+64+length*2]
                        if "string" in inp_type:
                            value = bytes.fromhex(data_hex).decode('utf-8', errors='ignore')
                        else:
                            value = f"0x{data_hex}"
                    except Exception:
                        value = f"0x{chunk}"
                
                parameters.append(DecodedParameter(name=inp_name, type=inp_type, value=value))
                offset += 64
            
            # Decode outputs if provided in metadata
            out_hex = (metadata or {}).get("output", "")
            if out_hex.startswith("0x"):
                out_hex = out_hex[2:]
            
            if out_hex and "outputs" in method_def:
                out_offset = 0
                for idx, out in enumerate(method_def["outputs"]):
                    out_type = out.get("type", "uint256")
                    out_name = out.get("name") or f"output_{idx}"
                    
                    chunk = out_hex[out_offset:out_offset+64]
                    if not chunk:
                        break
                    
                    value = f"0x{chunk}"
                    if "address" in out_type:
                        value = "0x" + chunk[-40:]
                    elif "uint" in out_type:
                        try:
                            value = int(chunk, 16)
                        except:
                            pass
                    elif "bool" in out_type:
                        value = int(chunk, 16) != 0
                    
                    outputs.append(DecodedOutput(name=out_name, type=out_type, value=value))
                    out_offset += 64

        # Decode events if provided in metadata
        decoded_events = []
        events_metadata = (metadata or {}).get("events", [])
        for ev in events_metadata:
            topics = ev.get("topics", [])
            data = ev.get("data", "")
            contract = ev.get("contract", "")
            
            if topics:
                topic0 = topics[0]
                if topic0.startswith("0x"):
                    topic0 = topic0[2:]
                
                ev_def = EVM_EVENTS.get(topic0)
                if ev_def:
                    ev_name = ev_def["name"]
                    ev_params = []
                    
                    # Decoded topics (indexed inputs)
                    # topic[1] is 1st indexed parameter, topic[2] is 2nd, etc.
                    topic_idx = 1
                    data_clean = data[2:] if data.startswith("0x") else data
                    data_offset = 0
                    
                    for inp in ev_def["inputs"]:
                        inp_name = inp["name"]
                        inp_type = inp["type"]
                        
                        if inp["indexed"]:
                            if topic_idx < len(topics):
                                val_hex = topics[topic_idx]
                                val = val_hex
                                if "address" in inp_type:
                                    val = "0x" + val_hex[-40:]
                                elif "uint" in inp_type:
                                    try:
                                        val = int(val_hex, 16)
                                    except:
                                        pass
                                ev_params.append(DecodedParameter(name=inp_name, type=inp_type, value=val))
                                topic_idx += 1
                        else:
                            # Parse from data
                            chunk = data_clean[data_offset:data_offset+64]
                            if chunk:
                                val = f"0x{chunk}"
                                if "address" in inp_type:
                                    val = "0x" + chunk[-40:]
                                elif "uint" in inp_type:
                                    try:
                                        val = int(chunk, 16)
                                    except:
                                        pass
                                ev_params.append(DecodedParameter(name=inp_name, type=inp_type, value=val))
                                data_offset += 64
                    
                    decoded_events.append(DecodedEvent(name=ev_name, contract=contract, parameters=ev_params))
                else:
                    # Generic Event
                    decoded_events.append(DecodedEvent(name=f"Event_{topic0[:8]}", contract=contract, parameters=[
                        DecodedParameter(name=f"topic_{idx}", type="bytes32", value=t) for idx, t in enumerate(topics)
                    ]))

        return DecodedData(method_name=method_name, parameters=parameters, events=decoded_events, outputs=outputs)

    @classmethod
    def decode_solana(cls, payload: str, metadata: Optional[Dict[str, Any]]) -> DecodedData:
        meta = metadata or {}
        program_id = meta.get("program_id", "11111111111111111111111111111111")
        accounts = meta.get("accounts", [])
        
        # Decode raw instruction data
        raw_bytes = b""
        payload_clean = payload.strip()
        
        try:
            if payload_clean.startswith("[") or payload_clean.startswith("{"):
                # might be JSON representation
                data_json = json.loads(payload_clean)
                if "data" in data_json:
                    payload_clean = data_json["data"]
                if "program_id" in data_json:
                    program_id = data_json["program_id"]
                if "accounts" in data_json:
                    accounts = data_json["accounts"]
        except:
            pass

        # Try hex first if it matches hex string format, then base58, then base64
        hex_candidate = payload_clean.replace("0x", "").strip()
        if all(c in "0123456789abcdefABCDEF" for c in hex_candidate) and len(hex_candidate) % 2 == 0:
            try:
                raw_bytes = bytes.fromhex(hex_candidate)
            except:
                raw_bytes = b""
        
        if not raw_bytes:
            try:
                raw_bytes = cls.decode_base58(payload_clean)
            except:
                try:
                    import base64
                    raw_bytes = base64.b64decode(payload_clean)
                except:
                    try:
                        raw_bytes = bytes.fromhex(payload_clean.replace("0x", ""))
                    except:
                        raw_bytes = payload_clean.encode()

        method_name = "Instruction"
        parameters = []
        
        # System Program
        if program_id == "11111111111111111111111111111111":
            if len(raw_bytes) >= 4:
                idx = int.from_bytes(raw_bytes[:4], 'little')
                if idx == 2: # Transfer
                    method_name = "Transfer"
                    if len(raw_bytes) >= 12:
                        lamports = int.from_bytes(raw_bytes[4:12], 'little')
                        sol_val = lamports / 1e9
                        parameters.append(DecodedParameter(name="lamports", type="u64", value=lamports))
                        parameters.append(DecodedParameter(name="sol_amount", type="f64", value=sol_val))
                    if len(accounts) >= 2:
                        parameters.append(DecodedParameter(name="from", type="pubkey", value=accounts[0]))
                        parameters.append(DecodedParameter(name="to", type="pubkey", value=accounts[1]))
                elif idx == 0: # CreateAccount
                    method_name = "CreateAccount"
                    if len(raw_bytes) >= 28:
                        lamports = int.from_bytes(raw_bytes[4:12], 'little')
                        space = int.from_bytes(raw_bytes[12:20], 'little')
                        owner = raw_bytes[20:52].hex()
                        parameters.append(DecodedParameter(name="lamports", type="u64", value=lamports))
                        parameters.append(DecodedParameter(name="space", type="u64", value=space))
                        parameters.append(DecodedParameter(name="owner", type="pubkey", value=owner))
                else:
                    method_name = f"SystemInstruction_{idx}"
        
        # Token Program
        elif program_id == "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA":
            if len(raw_bytes) >= 1:
                idx = raw_bytes[0]
                if idx == 3: # Transfer
                    method_name = "Transfer"
                    if len(raw_bytes) >= 9:
                        amount = int.from_bytes(raw_bytes[1:9], 'little')
                        parameters.append(DecodedParameter(name="amount", type="u64", value=amount))
                    if len(accounts) >= 3:
                        parameters.append(DecodedParameter(name="source", type="pubkey", value=accounts[0]))
                        parameters.append(DecodedParameter(name="destination", type="pubkey", value=accounts[1]))
                        parameters.append(DecodedParameter(name="authority", type="pubkey", value=accounts[2]))
                elif idx == 4: # Approve
                    method_name = "Approve"
                    if len(raw_bytes) >= 9:
                        amount = int.from_bytes(raw_bytes[1:9], 'little')
                        parameters.append(DecodedParameter(name="amount", type="u64", value=amount))
                    if len(accounts) >= 3:
                        parameters.append(DecodedParameter(name="source", type="pubkey", value=accounts[0]))
                        parameters.append(DecodedParameter(name="delegate", type="pubkey", value=accounts[1]))
                        parameters.append(DecodedParameter(name="owner", type="pubkey", value=accounts[2]))
                elif idx == 7: # MintTo
                    method_name = "MintTo"
                    if len(raw_bytes) >= 9:
                        amount = int.from_bytes(raw_bytes[1:9], 'little')
                        parameters.append(DecodedParameter(name="amount", type="u64", value=amount))
                    if len(accounts) >= 3:
                        parameters.append(DecodedParameter(name="mint", type="pubkey", value=accounts[0]))
                        parameters.append(DecodedParameter(name="destination", type="pubkey", value=accounts[1]))
                        parameters.append(DecodedParameter(name="authority", type="pubkey", value=accounts[2]))
                elif idx == 8: # Burn
                    method_name = "Burn"
                    if len(raw_bytes) >= 9:
                        amount = int.from_bytes(raw_bytes[1:9], 'little')
                        parameters.append(DecodedParameter(name="amount", type="u64", value=amount))
                    if len(accounts) >= 3:
                        parameters.append(DecodedParameter(name="source", type="pubkey", value=accounts[0]))
                        parameters.append(DecodedParameter(name="mint", type="pubkey", value=accounts[1]))
                        parameters.append(DecodedParameter(name="authority", type="pubkey", value=accounts[2]))
                elif idx == 12: # TransferChecked
                    method_name = "TransferChecked"
                    if len(raw_bytes) >= 10:
                        amount = int.from_bytes(raw_bytes[1:9], 'little')
                        decimals = raw_bytes[9]
                        parameters.append(DecodedParameter(name="amount", type="u64", value=amount))
                        parameters.append(DecodedParameter(name="decimals", type="u8", value=decimals))
                    if len(accounts) >= 4:
                        parameters.append(DecodedParameter(name="source", type="pubkey", value=accounts[0]))
                        parameters.append(DecodedParameter(name="mint", type="pubkey", value=accounts[1]))
                        parameters.append(DecodedParameter(name="destination", type="pubkey", value=accounts[2]))
                        parameters.append(DecodedParameter(name="authority", type="pubkey", value=accounts[3]))
                else:
                    method_name = f"TokenInstruction_{idx}"

        # Associated Token Account Program
        elif program_id == "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL":
            method_name = "CreateAssociatedTokenAccount"
            if len(accounts) >= 7:
                parameters.append(DecodedParameter(name="funding_account", type="pubkey", value=accounts[0]))
                parameters.append(DecodedParameter(name="associated_token_account", type="pubkey", value=accounts[1]))
                parameters.append(DecodedParameter(name="wallet_address", type="pubkey", value=accounts[2]))
                parameters.append(DecodedParameter(name="token_mint", type="pubkey", value=accounts[3]))

        else:
            # Try parsing custom instruction program
            method_name = f"ProgramCall_{program_id[:8]}"
            parameters.append(DecodedParameter(name="data_hex", type="bytes", value=raw_bytes.hex()))
            for idx, acc in enumerate(accounts):
                parameters.append(DecodedParameter(name=f"account_{idx}", type="pubkey", value=acc))

        return DecodedData(method_name=method_name, parameters=parameters)

    @classmethod
    def decode_sui(cls, payload: str) -> DecodedData:
        try:
            data = json.loads(payload)
        except:
            # Fallback if raw text
            return DecodedData(
                method_name="MoveCall",
                parameters=[DecodedParameter(name="payload", type="string", value=payload)]
            )
            
        package = data.get("package", "0x2")
        module = data.get("module", "coin")
        function = data.get("function", "transfer")
        type_args = data.get("type_arguments", [])
        args = data.get("arguments", [])
        
        method_name = f"{package}::{module}::{function}"
        parameters = []
        
        for idx, arg in enumerate(args):
            p_name = f"arg_{idx}"
            p_type = "any"
            if isinstance(arg, dict) and "type" in arg:
                p_type = arg["type"]
                arg = arg.get("value", arg)
            parameters.append(DecodedParameter(name=p_name, type=p_type, value=arg))
            
        for idx, t_arg in enumerate(type_args):
            parameters.append(DecodedParameter(name=f"type_arg_{idx}", type="type", value=t_arg))

        return DecodedData(method_name=method_name, parameters=parameters)

    @classmethod
    def decode_aptos(cls, payload: str) -> DecodedData:
        try:
            data = json.loads(payload)
        except:
            # Fallback if raw text
            return DecodedData(
                method_name="EntryFunction",
                parameters=[DecodedParameter(name="payload", type="string", value=payload)]
            )
            
        function = data.get("function", "0x1::coin::transfer")
        type_args = data.get("type_arguments", [])
        args = data.get("arguments", [])
        
        parameters = []
        
        for idx, arg in enumerate(args):
            parameters.append(DecodedParameter(name=f"arg_{idx}", type="any", value=arg))
            
        for idx, t_arg in enumerate(type_args):
            parameters.append(DecodedParameter(name=f"type_arg_{idx}", type="type", value=t_arg))

        return DecodedData(method_name=function, parameters=parameters)

    @classmethod
    def decode_bitcoin(cls, payload: str) -> DecodedData:
        payload_clean = payload.strip()
        
        # Check if payload is assembly text or hex
        is_hex = True
        try:
            script_bytes = bytes.fromhex(payload_clean.replace("0x", ""))
        except:
            is_hex = False
            
        tokens = []
        if is_hex:
            tokens = cls.parse_btc_script(script_bytes)
        else:
            tokens = payload_clean.split()
            
        method_name = "BitcoinScript"
        parameters = []
        
        # Try to identify standard templates
        # P2PKH: OP_DUP OP_HASH160 <20-byte-hash> OP_EQUALVERIFY OP_CHECKSIG
        if len(tokens) == 5 and tokens[0] == "OP_DUP" and tokens[1] == "OP_HASH160" and tokens[3] == "OP_EQUALVERIFY" and tokens[4] == "OP_CHECKSIG":
            method_name = "Pay-to-Public-Key-Hash (P2PKH)"
            parameters.append(DecodedParameter(name="pubKeyHash", type="hash160", value=tokens[2]))
        # P2SH: OP_HASH160 <20-byte-hash> OP_EQUAL
        elif len(tokens) == 3 and tokens[0] == "OP_HASH160" and tokens[2] == "OP_EQUAL":
            method_name = "Pay-to-Script-Hash (P2SH)"
            parameters.append(DecodedParameter(name="scriptHash", type="hash160", value=tokens[1]))
        # P2WPKH: OP_0 <20-byte-hash>
        elif len(tokens) == 2 and tokens[0] == "OP_0" and len(tokens[1]) == 40:
            method_name = "Pay-to-Witness-Public-Key-Hash (P2WPKH)"
            parameters.append(DecodedParameter(name="pubKeyHash", type="hash160", value=tokens[1]))
        # P2WSH: OP_0 <32-byte-hash>
        elif len(tokens) == 2 and tokens[0] == "OP_0" and len(tokens[1]) == 64:
            method_name = "Pay-to-Witness-Script-Hash (P2WSH)"
            parameters.append(DecodedParameter(name="scriptHash", type="sha256", value=tokens[1]))
        # OP_RETURN: OP_RETURN <data>
        elif len(tokens) >= 1 and tokens[0] == "OP_RETURN":
            method_name = "Null Data (OP_RETURN)"
            if len(tokens) > 1:
                data_hex = tokens[1]
                parameters.append(DecodedParameter(name="data_hex", type="bytes", value=data_hex))
                try:
                    decoded_str = bytes.fromhex(data_hex).decode('utf-8', errors='ignore')
                    parameters.append(DecodedParameter(name="data_ascii", type="string", value=decoded_str))
                except:
                    pass
        # Multisig: OP_M <pubkeys...> OP_N OP_CHECKMULTISIG
        elif len(tokens) >= 4 and tokens[-1] == "OP_CHECKMULTISIG":
            method_name = "Multisig Script"
            try:
                m_val = tokens[0].replace("OP_", "")
                n_val = tokens[-2].replace("OP_", "")
                parameters.append(DecodedParameter(name="required_signatures_M", type="int", value=m_val))
                parameters.append(DecodedParameter(name="total_public_keys_N", type="int", value=n_val))
                pubkeys = tokens[1:-2]
                for idx, pk in enumerate(pubkeys):
                    parameters.append(DecodedParameter(name=f"pubkey_{idx}", type="pubkey", value=pk))
            except Exception:
                pass
        else:
            method_name = "Custom / Non-Standard Script"
            
        parameters.append(DecodedParameter(name="assembly_disassembly", type="script_assembly", value=" ".join(tokens)))
        
        return DecodedData(method_name=method_name, parameters=parameters)

    @classmethod
    async def analyze_with_ai(cls, req_type: str, decoded: DecodedData, payload: str, metadata: Optional[Dict[str, Any]]) -> Optional[AnalysisResult]:
        if not settings.OPENROUTER_API_KEY:
            return None
            
        system_prompt = (
            "You are a blockchain security analytics tool. You decode transaction payloads and explain them to users.\n"
            "Analyze the given decoded transaction data and output a JSON response containing:\n"
            "1. 'explanation': A clear, user-friendly 1-2 sentence description of what the transaction does.\n"
            "2. 'asset_movement': An array of tokens or native coins being moved, including: 'asset', 'from_address', 'to_address', 'amount', 'direction' ('in', 'out', or 'transfer').\n"
            "3. 'implications': Technical or governance or financial changes caused by this execution.\n"
            "4. 'risks': A list of detected risks with 'severity' (INFO, LOW, MEDIUM, HIGH, CRITICAL) and 'description'.\n\n"
            "Your output MUST be a valid JSON object ONLY. Do not wrap it in markdown code blocks like ```json."
        )
        
        user_prompt = f"Protocol Type: {req_type}\nMethod Name: {decoded.method_name}\n"
        user_prompt += f"Parameters:\n"
        for p in decoded.parameters:
            user_prompt += f"- {p.name} ({p.type}): {p.value}\n"
            
        if decoded.events:
            user_prompt += f"Events emitted:\n"
            for ev in decoded.events:
                ev_params = ", ".join([f"{p.name}={p.value}" for p in ev.parameters])
                user_prompt += f"- {ev.name} at {ev.contract}: {ev_params}\n"
                
        if decoded.outputs:
            user_prompt += f"Return outputs:\n"
            for o in decoded.outputs:
                user_prompt += f"- {o.name or 'Output'} ({o.type}): {o.value}\n"
                
        user_prompt += f"Raw Payload: {payload}\n"
        user_prompt += f"Metadata: {json.dumps(metadata or {})}\n"
        
        try:
            headers = {
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://blockspectra.io", 
                "X-Title": "BlockSpectra Intelligence Engine"
            }
            
            payload_data = {
                "model": settings.OPENROUTER_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.1
            }

            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload_data
                )
                
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"].strip()
                    # Strip standard markdown blocks if model output them regardless
                    if content.startswith("```"):
                        content = re.sub(r"^```(?:json)?\n", "", content)
                        content = re.sub(r"\n```$", "", content)
                    content = content.strip()
                    
                    parsed = json.loads(content)
                    
                    asset_movements = []
                    for m in parsed.get("asset_movement", []):
                        asset_movements.append(AssetMovement(
                            asset=m.get("asset", "Unknown"),
                            from_address=m.get("from_address"),
                            to_address=m.get("to_address"),
                            amount=str(m.get("amount", "0")),
                            direction=m.get("direction", "transfer")
                        ))
                        
                    risks = []
                    for r in parsed.get("risks", []):
                        risks.append(RiskDetail(
                            severity=r.get("severity", "INFO"),
                            description=r.get("description", "Unknown risk factor")
                        ))
                        
                    return AnalysisResult(
                        explanation=parsed.get("explanation", "Transaction processed."),
                        asset_movement=asset_movements,
                        implications=parsed.get("implications", "Standard execution details."),
                        risks=risks
                    )
        except Exception as e:
            logger.error(f"OpenRouter decode analysis failed: {e}")
            
        return None

    @classmethod
    def get_static_fallback(cls, req_type: str, decoded: DecodedData, payload: str, metadata: Optional[Dict[str, Any]]) -> AnalysisResult:
        """
        Comprehensive fallback mapping rules for static decoding.
        """
        explanation = "Transaction execution on target blockchain."
        asset_movements = []
        implications = "This executes a state-modifying instruction on-chain."
        risks = [RiskDetail(severity="INFO", description="Static fallback analysis applied. Verify contract addresses manual review.")]
        
        # 1. Ethereum Fallbacks
        if req_type == "ethereum":
            name = decoded.method_name
            params = {p.name: p.value for p in decoded.parameters}
            
            if name == "transfer":
                to_addr = str(params.get("to", ""))
                val = params.get("value", 0)
                amount_str = str(val)
                # Formats
                explanation = f"ERC20 transfer of {val} tokens to {to_addr}."
                asset_movements.append(AssetMovement(asset="Token", from_address="Sender", to_address=to_addr, amount=amount_str, direction="transfer"))
                implications = "Transfers ERC20 token balances between the sender and receiver. Decreases sender balance."
                
                # Risk Checks
                if to_addr == "0x0000000000000000000000000000000000000000" or to_addr.startswith("0x00000000"):
                    risks.append(RiskDetail(severity="HIGH", description="Tokens are sent to a zero/null burn address, making them permanently unrecoverable."))
                elif to_addr == "0x72a587DB711757529870b1774e3067ddD24a4fcf": # Mock mixer address
                    risks.append(RiskDetail(severity="CRITICAL", description="Interaction with flagged privacy mixer (Tornado Cash). Risk of immediate asset freezing."))
                    
            elif name == "approve":
                spender = str(params.get("spender", ""))
                val = params.get("value", 0)
                explanation = f"ERC20 approval of {val} tokens to spender {spender}."
                implications = f"Grants the spender address {spender} permission to pull up to {val} tokens from your wallet."
                
                if isinstance(val, int) and val > 10**18:  # unlimited approvals
                    risks.append(RiskDetail(severity="HIGH", description="Unlimited ERC20 approval requested. Spender can drain all associated tokens from owner wallet."))
                else:
                    risks.append(RiskDetail(severity="LOW", description="Standard ERC20 approval limit. Spender can only transfer approved amount."))

            elif name.startswith("swap"):
                explanation = f"Token swap operation on Decentralized Exchange (DEX)."
                implications = "Executes multi-hop trade routing in liquidity pools, exchanging input tokens for outputs."
                risks.append(RiskDetail(severity="LOW", description="Verify DEX contract authenticity and slippage parameters to avoid sandwich attacks."))

        # 2. Solana Fallbacks
        elif req_type == "solana":
            name = decoded.method_name
            params = {p.name: p.value for p in decoded.parameters}
            
            if name == "Transfer":
                to_addr = str(params.get("to", "Receiver"))
                sol = params.get("sol_amount", 0.0)
                amount = params.get("amount", 0)
                
                if sol > 0.0:
                    explanation = f"SOL transfer of {sol} SOL to {to_addr}."
                    asset_movements.append(AssetMovement(asset="SOL", from_address="Sender", to_address=to_addr, amount=f"{sol} SOL", direction="transfer"))
                else:
                    explanation = f"Token transfer of {amount} units to {to_addr}."
                    asset_movements.append(AssetMovement(asset="SPL-Token", from_address="Sender", to_address=to_addr, amount=str(amount), direction="transfer"))
                    
                implications = "Decreases sender's token/SOL account balance and increases receiver's balance."
                if to_addr == "11111111111111111111111111111111":
                    risks.append(RiskDetail(severity="HIGH", description="Transferring assets directly to System Program. Funds will be permanently lost."))
                    
            elif name == "Approve":
                delegate = str(params.get("delegate", "Delegate"))
                amount = params.get("amount", 0)
                explanation = f"Solana Token delegation approval of {amount} tokens to delegate {delegate}."
                implications = f"Allows the delegate account to transfer up to {amount} tokens from your associated token account."
                risks.append(RiskDetail(severity="MEDIUM", description="Delegate could withdraw funds without warning. Revoke delegation after use."))

            elif name == "CreateAccount":
                owner = str(params.get("owner", "Owner"))
                lamports = params.get("lamports", 0)
                explanation = f"Creates a new on-chain account owned by program {owner}."
                implications = f"Allocates space and funds the rent-exempt balance using {lamports} lamports."
                risks.append(RiskDetail(severity="INFO", description="Standard account creation on Solana."))

        # 3. Sui Fallbacks
        elif req_type == "sui":
            explanation = f"Sui Move call to function: {decoded.method_name}."
            implications = "Triggers Sui Move virtual machine execution. Modifies on-chain object storage states."
            
            if "coin::transfer" in decoded.method_name or "coin::split_and_transfer" in decoded.method_name:
                explanation = "Transfer Sui Coin object to destination address."
                asset_movements.append(AssetMovement(asset="SUI/Object", from_address="Sender", to_address="Receiver", amount="Dynamic", direction="transfer"))
                implications = "Transfers Sui object ownership, resulting in a state mutation on the Sui global object store."
                risks.append(RiskDetail(severity="INFO", description="Standard Move coin transfer."))
            else:
                risks.append(RiskDetail(severity="LOW", description="Ensure Sui package ID is verified to avoid malicious module hijacking."))

        # 4. Aptos Fallbacks
        elif req_type == "aptos":
            explanation = f"Aptos EntryFunction transaction payload: {decoded.method_name}."
            implications = "Invokes an entry function compiled in Move bytecode on the Aptos Mainnet."
            
            if "coin::transfer" in decoded.method_name:
                explanation = "Aptos coin transfer transaction."
                asset_movements.append(AssetMovement(asset="AptosCoin", from_address="Sender", to_address="Receiver", amount="Dynamic", direction="transfer"))
                implications = "Decrements coin balance of sender resource and increments receiver resource."
                risks.append(RiskDetail(severity="INFO", description="Standard Aptos transfer call."))
            else:
                risks.append(RiskDetail(severity="LOW", description="Verify package publishing authority to prevent executing unverified bytecode upgrades."))

        # 5. Bitcoin Fallbacks
        elif req_type == "bitcoin":
            name = decoded.method_name
            params = {p.name: p.value for p in decoded.parameters}
            
            if "P2PKH" in name:
                h = params.get("pubKeyHash", "hash")
                explanation = "Pay-to-Public-Key-Hash (P2PKH) output script. Standard output script type."
                implications = f"Requires a signature from the private key corresponding to public key hash {h} to spend."
                risks.append(RiskDetail(severity="INFO", description="Standard, secure legacy Bitcoin output format."))
            elif "P2SH" in name:
                explanation = "Pay-to-Script-Hash (P2SH) output script."
                implications = "Requires matching script hash preimage and signatures of redeem script to spend. Often used for Multisig or SegWit."
                risks.append(RiskDetail(severity="INFO", description="Standard multisig/SegWit output format."))
            elif "OP_RETURN" in name:
                ascii_data = params.get("data_ascii", "")
                explanation = f"OP_RETURN data storage output script containing: '{ascii_data}'."
                implications = "Stores arbitrary, unspendable metadata directly in the Bitcoin UTXO history."
                risks.append(RiskDetail(severity="LOW", description="Assets sent to OP_RETURN script are unspendable (burnt). Verify inputs."))
            elif "Multisig" in name:
                m = params.get("required_signatures_M", "M")
                n = params.get("total_public_keys_N", "N")
                explanation = f"Multisig output script requiring {m} of {n} signatures to spend."
                implications = "Provides enhanced security by distributing spending authority among multiple private keys."
                risks.append(RiskDetail(severity="INFO", description="Provides solid escrow / multi-party protection."))
                
        return AnalysisResult(
            explanation=explanation,
            asset_movement=asset_movements,
            implications=implications,
            risks=risks
        )

    @classmethod
    async def decode(cls, request: DecodeRequest) -> DecodeResponse:
        req_type = request.type.lower()
        payload = request.payload.strip()
        abi = request.abi
        metadata = request.metadata or {}
        
        # Resolve Transaction Hash dynamically in real-time
        if req_type == "ethereum" and payload.startswith("0x") and len(payload) == 66:
            from app.data_providers.etherscan import fetch_tx_calldata
            details = await fetch_tx_calldata(req_type, payload)
            if details:
                payload = details["input"]
                metadata["tx_hash"] = request.payload.strip()
                metadata["to"] = details["to"]
                metadata["value"] = details["value"]
        
        try:
            # 1. Decode structural fields
            if req_type == "ethereum":
                decoded = cls.decode_ethereum(payload, abi, metadata)
            elif req_type == "solana":
                decoded = cls.decode_solana(payload, metadata)
            elif req_type == "sui":
                decoded = cls.decode_sui(payload)
            elif req_type == "aptos":
                decoded = cls.decode_aptos(payload)
            elif req_type == "bitcoin":
                decoded = cls.decode_bitcoin(payload)
            else:
                raise ValueError(f"Unsupported protocol type: {req_type}")
                
            # 2. Analyze with AI or fallback
            analysis = await cls.analyze_with_ai(req_type, decoded, payload, metadata)
            if not analysis:
                analysis = cls.get_static_fallback(req_type, decoded, payload, metadata)
                
            return DecodeResponse(
                success=True,
                type=req_type,
                decoded=decoded,
                analysis=analysis
            )
            
        except Exception as e:
            logger.error(f"Failed decoding payload of type {req_type}: {e}", exc_info=True)
            # Safe empty/error response
            return DecodeResponse(
                success=False,
                type=req_type,
                decoded=DecodedData(method_name="DecodingError", parameters=[DecodedParameter(name="error", type="string", value=str(e))]),
                analysis=AnalysisResult(
                    explanation="An error occurred while attempting to parse this transaction payload.",
                    asset_movement=[],
                    implications="None. Decode failed.",
                    risks=[RiskDetail(severity="HIGH", description=f"Parsing error: {str(e)}")]
                )
            )
