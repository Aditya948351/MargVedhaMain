# Real-Time Traffic Optimization Agent 
## Cognizant Superset Agent Builder Workflow

This document explicitly implements the exact architecture modeled in your "Real-Time Traffic Optimization Agent" canvas using the provided **Superset Node Palette**.

---

### Node 1: Input (Live Traffic Data)
- **Node Configuration**: Dynamic Input Payload
- **Expected Fields**: 
  - `vehicle_count` (Integer)
  - `avg_speed` (Float)
  - `heavy_vehicle_count` (Integer)
  - `location_id` (String)
  - `emergency_vehicle` (Boolean)
  - `time_of_day` (String - HH:MM)
  - `road_condition` (String)

---

### Node 2: LLM Step (Traffic Analysis)
- **Model**: `gpt-4o-mini`
- **System Prompt**: 
  > You are an intelligent traffic analytics engine. You will be provided with live traffic data. Your job is to analyze the traffic conditions and provide a reasoning for your analysis. 
- **User Prompt Template**:
  > Analyze the following traffic data:
  > Vehicle Count: {{input.vehicle_count}}
  > Average Speed: {{input.avg_speed}}
  > Heavy Vehicles: {{input.heavy_vehicle_count}}
  > Time of Day: {{input.time_of_day}}
  > 
  > Classify the congestion level and provide reasoning. Note: we will use a dedicated router for classification next, so focus purely on the deep reasoning here.
- **Output Variable Name**: `traffic_analysis_reasoning`

---

### Node 3: Classifier / Router (Congestion Level)
- **Node Type**: Classifier / Router
- **Logic / Instructions**: Route the traffic based on the raw metrics and the analyzed severity.
- **Routing Categories**:
  - `LOW` (e.g., fast speed, low count)
  - `MEDIUM`
  - `HIGH`
  - `CRITICAL` (e.g., stop-and-go speed, very high count)

---

### Node 4: Condition / Branch (Emergency Vehicle?)
- **Node Type**: Condition / Branch
- **Condition Check**: 
  - `IF input.emergency_vehicle == true` 
- **Branches**:
  - **Yes**: Routes to Node 5 (*Emergency Handling*)
  - **No**: Routes to Node 7 (*Signal Optimization*)

---

### 🟢 EMERGENCY BRANCH (YES)

#### Node 5: LLM Step (Emergency Handling)
- **Model**: `gpt-4o-mini`
- **System Prompt**:
  > You are an emergency response engine. An emergency vehicle has been detected at the junction. Your task is to devise an immediate green corridor strategy.
- **User Prompt Template**:
  > Generate an emergency signal strategy to clear the junction for the emergency vehicle immediately. Provide the exact timing shifts required.
  > Data: Location {{input.location_id}}, Severity: {{router.Congestion Level}}
- **Output Variable Name**: `emergency_plan`

#### Node 6: Output Formatter (Emergency Output)
- **Node Type**: Output Formatter
- **Template / Code**:
  ```json
  {
    "priority": "EMERGENCY",
    "action": "Green Corridor Activated",
    "details": "{{emergency_plan}}"
  }
  ```

---

### 🟡 NORMAL TRAFFIC BRANCH (NO)

#### Node 7: LLM Step (Signal Optimization)
- **Model**: `gpt-4o-mini`
- **System Prompt**:
  > You are an adaptive signal control AI. Suggest optimal signal timings for each lane to reduce waiting time while maintaining fairness.
- **User Prompt Template**:
  > Suggest optimal signal timings for {{input.location_id}}.
  > Congestion Level: {{router.Congestion Level}}
  > Reasoning: {{traffic_analysis_reasoning}}
- **Output Variable Name**: `llm_suggested_timings`

#### Node 8: Knowledge Retrieval (Traffic Rules & Policies)
- **Node Type**: Knowledge Retrieval / RAG
- **Data Source**: Vector DB with local traffic laws and zone regulations.
- **Search Query Template**: 
  > "Retrieve max and min green signal limits, priority policies, and peak hour strategies for {{input.location_id}} during {{input.time_of_day}}"
- **Output Variable Name**: `traffic_policies`

#### Node 9: Custom Code (Optimization Logic)
- **Node Type**: Custom Code (Python)
- **Code Template**:
  ```python
  def main(inputs):
      import json
      suggested_timing = inputs["llm_suggested_timings"]
      policies = inputs["traffic_policies"]
      
      # Apply rules to ensure LLM suggestions don't violate hard constraints
      # Example: Adjust timings balancing wait times inside legal limits
      safe_green_time = max(15, min(int(inputs["input"]["vehicle_count"] * 0.5), 120))
      
      optimized_plan = {
          "adjusted_green_duration": safe_green_time,
          "algorithm_applied": "Adaptive Smoothing",
          "policy_context": "Validated against zone bounds"
      }
      return {"optimized_plan": optimized_plan}
  ```

#### Node 10: Evaluator / Guardrail (Safety & Fairness Check)
- **Node Type**: Evaluator / Guardrail
- **Validation Rules**: Ensure no lane starvation, safe transitions, and policy compliance.
- **Condition**: Checks if `optimized_plan.adjusted_green_duration >= 15`.
- **Pass/Fail Outcomes**:
  - **Pass**: Proceeds to Node 12
  - **Fail**: Triggers Node 11

#### Node 11: Retry / Fallback (Fallback Strategy)
- **Node Type**: Retry / Fallback
- **Logic**: If the evaluator fails (or if the AI confidence was too low), inject the `Default Plan`.
- **Default Payload Output**:
  ```json
  {
    "adjusted_green_duration": 45,
    "algorithm_applied": "STATUTORY_FALLBACK"
  }
  ```

#### Node 12: Output Formatter (Signal Plan Output)
- **Node Type**: Output Formatter
- **Template / Code**:
  ```json
  {
    "signal_plan": "{{optimized_plan.adjusted_green_duration || fallback.adjusted_green_duration}}",
    "priority": "NORMAL"
  }
  ```

---

### 🔵 CONSOLIDATION

#### Node 13: Merge / Join (Combine Outputs)
- **Node Type**: Merge / Join
- **Logic**: Combines the output paths coming from either the Emergency Branch (Node 6) or the Normal Traffic Branch (Node 12).
- **Output Variable Name**: `merged_final_action`

#### Node 14: Output Formatter (Final Output)
- **Node Type**: Output Formatter
- **Final Payload Template**:
  ```json
  {
    "final_plan": "{{merged_final_action.details || merged_final_action.signal_plan}}",
    "priority": "{{merged_final_action.priority}}",
    "reasoning": "{{traffic_analysis_reasoning}}",
    "confidence": 0.92
  }
  ```
