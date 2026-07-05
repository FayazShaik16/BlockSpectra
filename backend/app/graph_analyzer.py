import networkx as nx
from typing import List, Dict, Any

class GraphAnalyzer:
    @staticmethod
    def analyze(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], seed_address: str) -> Dict[str, Any]:
        """
        Uses NetworkX to build a graph, execute graph algorithms, and extract threat metrics.
        Returns:
            {
                "nodes": updated_nodes_with_scores,
                "edges": edges,
                "report": {
                    "central_entities": [...],
                    "attack_paths": [...],
                    "suspicious_clusters": [...],
                    "bridge_movements": [...],
                    "money_flow": [...]
                }
            }
        """
        # Create Directed Graph
        G = nx.DiGraph()

        # Build node mapping for easy lookup
        node_map = {n["id"].lower(): n for n in nodes}
        seed_address_lower = seed_address.lower()

        # Add nodes with attributes
        for n in nodes:
            G.add_node(n["id"].lower(), **n)

        # Add edges with attributes
        for e in edges:
            G.add_edge(
                e["source"].lower(),
                e["target"].lower(),
                type=e.get("type", "Transfer"),
                value_usd=float(e.get("value_usd", 0.0)),
                chain=e.get("chain", ""),
                label=e.get("label", "")
            )

        # 1. PageRank Centrality (identifies highly active/connected hubs, i.e., central entities)
        pageranks = {}
        if G.number_of_nodes() > 0:
            try:
                # Use value_usd as weight if available
                pageranks = nx.pagerank(G, weight="value_usd", alpha=0.85)
            except Exception:
                pageranks = nx.pagerank(G, alpha=0.85)

        # 2. Risk Scoring & Propagation
        # Seed address starts with a moderate-to-high risk depending on context, mixer and high-risk wallets start at 100.
        # We propagate risk values based on shortest path distance.
        risk_scores = {}
        for n_id, n_data in G.nodes(data=True):
            n_type = n_data.get("type", "Wallet").lower()
            label = n_data.get("label", "").lower()
            
            # Base risks
            if n_id == seed_address_lower:
                risk_scores[n_id] = 75
            elif "mixer" in label or "tornado" in label or n_type == "mixer" or "exploit" in label:
                risk_scores[n_id] = 100
            elif n_type == "bridge":
                risk_scores[n_id] = 55
            elif n_type == "exchange" or "binance" in label or "hot wallet" in label:
                risk_scores[n_id] = 40
            else:
                risk_scores[n_id] = 20  # Default low risk

        # Propagate risk: nodes directly connected to high risk nodes inherit higher risk
        for u, v, data in G.edges(data=True):
            u_risk = risk_scores.get(u, 20)
            v_risk = risk_scores.get(v, 20)
            # Simple propagation: if source is high risk, destination gets a fraction of it
            if u_risk > v_risk:
                new_v_risk = int(u_risk * 0.85)
                if new_v_risk > v_risk:
                    risk_scores[v] = new_v_risk

        # Write PageRank and Risk back to nodes dicts
        for n in nodes:
            n_id = n["id"].lower()
            n["risk_score"] = risk_scores.get(n_id, n.get("risk_score", 20))
            n["pagerank"] = round(pageranks.get(n_id, 0.0) * 1000, 2)  # Scale for display

        # 3. Central Entities list (sorted by PageRank)
        central_entities = []
        sorted_pageranks = sorted(pageranks.items(), key=lambda x: x[1], reverse=True)
        for node_id, pr_val in sorted_pageranks[:5]:
            n_data = node_map.get(node_id)
            if n_data:
                central_entities.append({
                    "id": n_data["id"],
                    "label": n_data["label"],
                    "type": n_data["type"],
                    "chain": n_data.get("chain", ""),
                    "pagerank_score": round(pr_val * 100, 2),
                    "risk_score": risk_scores.get(node_id, 20)
                })

        # 4. Attack Paths
        # Find paths from seed address to known suspicious/high-risk nodes (Risk >= 80)
        attack_paths = []
        suspicious_targets = [n_id for n_id, score in risk_scores.items() if score >= 80 and n_id != seed_address_lower]
        
        for target in suspicious_targets:
            if nx.has_path(G, seed_address_lower, target):
                try:
                    paths = list(nx.all_shortest_paths(G, seed_address_lower, target))
                    for path in paths[:2]:  # Limit to top 2 paths per target
                        steps = []
                        for i in range(len(path) - 1):
                            u, v = path[i], path[i+1]
                            edge_data = G[u][v]
                            steps.append({
                                "source": node_map[u]["label"],
                                "target": node_map[v]["label"],
                                "type": edge_data["type"],
                                "value_usd": edge_data["value_usd"],
                                "chain": edge_data["chain"]
                            })
                        attack_paths.append({
                            "target_label": node_map[target]["label"],
                            "risk_score": risk_scores[target],
                            "steps": steps
                        })
                except Exception:
                    pass

        # 5. Suspicious Clusters (connected components)
        suspicious_clusters = []
        components = list(nx.weakly_connected_components(G))
        for idx, comp in enumerate(components):
            comp_nodes = [node_map[n_id] for n_id in comp if n_id in node_map]
            max_risk = max([risk_scores.get(n_id, 20) for n_id in comp])
            if max_risk >= 60:
                suspicious_clusters.append({
                    "cluster_id": f"cluster_{idx + 1}",
                    "node_count": len(comp),
                    "max_risk": max_risk,
                    "nodes": [n["label"] for n in comp_nodes[:6]]  # Sample nodes for display
                })

        # 6. Bridge Movements & traversal
        bridge_movements = []
        for u, v, data in G.edges(data=True):
            if data["type"].lower() == "bridge" or node_map.get(u, {}).get("type") == "Bridge" or node_map.get(v, {}).get("type") == "Bridge":
                bridge_movements.append({
                    "source": node_map[u]["label"],
                    "source_chain": node_map[u].get("chain", ""),
                    "target": node_map[v]["label"],
                    "target_chain": node_map[v].get("chain", ""),
                    "value_usd": data["value_usd"],
                    "bridge_label": data.get("label", "Cross-chain Bridge")
                })

        # 7. Money Flow analysis
        money_flow = []
        # Calculate sum of value_usd outgoing from seed address and passing through other nodes
        for node_id in G.nodes:
            outgoing = G.out_edges(node_id, data=True)
            incoming = G.in_edges(node_id, data=True)
            in_val = sum([data.get("value_usd", 0.0) for _, _, data in incoming])
            out_val = sum([data.get("value_usd", 0.0) for _, _, data in outgoing])
            if in_val > 0 or out_val > 0:
                money_flow.append({
                    "entity": node_map[node_id]["label"],
                    "type": node_map[node_id]["type"],
                    "received_usd": round(in_val, 2),
                    "transferred_usd": round(out_val, 2)
                })
        # Sort money flow by maximum volume
        money_flow = sorted(money_flow, key=lambda x: max(x["received_usd"], x["transferred_usd"]), reverse=True)[:6]

        return {
            "nodes": nodes,
            "edges": edges,
            "report": {
                "central_entities": central_entities,
                "attack_paths": attack_paths,
                "suspicious_clusters": suspicious_clusters,
                "bridge_movements": bridge_movements,
                "money_flow": money_flow
            }
        }
