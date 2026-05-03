# 🛡️ MargVedha: Cross-Question Defense Guide

Use this sheet to confidently answer tough architectural questions from the judges in Round 2.

### Q1: "Why are you using an LLM (Sarvam AI) for traffic lights? Isn’t that too slow and dangerous for control?"
**Answer:** 
"We completely agree, which is why we **do not** use LLMs for signal control. 
If you look at **Node 7 (Decision Node)**, the actual signal timings are mathematically calculated using a **Q-Learning Optimization Engine**, and safety limits are enforced by a hard-coded **Guardrail (Node 14)**. 
We only use Sarvam AI in **Nodes 5, 12, and 17** for *Human-in-the-Loop* tasks: understanding complex contextual incidents, generating multilingual citizen alerts (Hindi/Marathi), and writing executive summaries for admins. Control is pure RL and math."

### Q2: "How are you extracting the traffic data? API calls or standard object detection?"
**Answer:**
"We run **YOLOv11 integrated with Bot-SORT** on the edge (Node 2). We specifically chose this stack because Bot-SORT provides state-of-the-art vehicle tracking which prevents double-counting vehicles stopped at a red light. YOLOv11 handles the rapid lane differentiation and emergency vehicle classification natively. We don't rely on generic generative AI for vision."

### Q3: "What happens if your Q-Learning model crashes or the internet drops at the junction?"
**Answer:**
"That is exactly why we built the **Retry/Fallback Engine (Node 15)**. We implemented the **Gauss-Seidel Method** as our fallback state. If the reinforcement learning model times out, fails the Node 14 Safety Guardrail, or loses network connection, the system instantly bypasses the AI and reverts to statutory fixed-time signals ensuring the junction never goes blind."

### Q4: "How does the Green Corridor feature actually work across multiple agents?"
**Answer:**
"When the Vision node detects an ambulance, **Node 8 (Priority Router)** instantly intercepts the flow. It bypasses the standard Q-learning optimizer and triggers **Node 8A (Priority Override)**. This forces max-green for that specific lane and uses standard APIs to preemptively notify the downstream junction agents, creating a ripple-effect clearance."

### Q5: "How does the system enforce violations without human bias?"
**Answer:**
"Our **Smart Enforcement Tool (Node 10)** is completely decoupled from the signal optimizer. It continuously monitors the feed for helmet violations or stop-line jumps using ANPR. When a violation is detected, the **Challan Generator (Node 11)** automatically queries the Regional Transport database, formats the challan with a UPI payment link, and securely updates the database. The citizen gets their alert via our Sarvam-powered communication agent."
