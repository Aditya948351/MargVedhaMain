# MargVedha – Cognizant Superset Agent Builder (Final Workflow)
## Architecture integrating the Firebase Model Context Protocol (MCP)

This represents the final, highly detailed workflow for the Superset Agent Builder Platform using native **Firebase MCP Tools** for database execution, replacing traditional custom code with semantic MCP agent-tool invocations.

---

### Phase 1: Real-time Ingestion & Vision Analytics
#### **Node 1: INPUT NODE - Traffic Data Intake**
*   **Trigger Type**: External Webhook / Push Event
*   **Payload Schema**:
    ```json
    {
      "junction_id": "Junc_12", 
      "timestamp": "2026-04-23T10:00:00Z",
      "emergency_alert_active": false
    }
    ```

#### **Node 2: TOOL NODE - Vision Processing (YOLOv8 / OpenCV)**
*   **Tool Execution**: Custom Python environment
*   **Action**: Consumes local CCTV feed, runs detection, and outputs structured insight.
*   **Output Payload**:
    ```json
    {
        "vehicle_count": 142,
        "queue_length_meters": 35.5,
        "emergency_detected": false
    }
    ```

---

### Phase 2: Memory Integration via Firebase MCP
#### **Node 3: MEMORY NODE - Traffic Data Store (Firebase MCP)**
*   **Action**: Store the current vision snapshot instantly in Firestore using standard MCP methods.
*   **MCP Tool Called**: `mcp_firebase-mcp-server_firestore_update_document`
*   **MCP Arguments**:
    ```json
    {
      "document": {
         "name": "projects/traffic-optimization-1e1bd/databases/(default)/documents/traffic_police/Junc_12",
         "fields": {
             "liveVehicleCount": { "integerValue": "142" },
             "status": { "stringValue": "Congested" },
             "lastUpdated": { "timestampValue": "2026-04-23T10:00:00Z" }
         }
      }
    }
    ```

#### **Node 4: CUSTOM CODE - Data Preprocessing**
*   **Action**: Calculates standard congestion densities to feed into the prediction models.
*   **Logic (JS)**:
    ```javascript
    const maxCapacity = 150;
    export default async function (inputs) {
        let density = inputs.visionOutput.vehicle_count / maxCapacity;
        return { 
            normalized_density: Math.max(0, Math.min(density, 1)),
            queue: inputs.visionOutput.queue_length_meters
        };
    }
    ```

---

### Phase 3: Agentic Execution & Predictive Routing
#### **Node 5: LLM STEP - Context Understanding Agent (Sarvam AI)**
*   **System Prompt**: 
    > "You are MargVedha's Context Analyzer operating in Indian urban centers. Analyze the provided structured traffic dataset. Classify congestion level on a scale of 'Low, Medium, High, Extreme'. Identify any emergent anomalies (e.g. queue buildup exceeding normal thresholds). Respond strictly in JSON format."
*   **Input Data**: `{{Node4.output}}`

#### **Node 6: PREDICTION NODE - Traffic Forecast Model**
*   **Action**: Invokes an external LSTM/RF model endpoint.
*   **Forecast horizon**: Predicts traffic condition at `T+15` mins based on context.

#### **Node 7: DECISION NODE - Intelligent Optimization Engine (Q-Learning)**
*   **Action**: Conditional logic graph.
*   **Branching Condition**:
    *   **IF** `Node2.emergency_detected == true` OR Node1 indicated emergency -> Trigger **Node 8A: Priority Override**.
    *   **ELSE** calculate optimal signal phase plan (ex: NS_Green: 60s, EW_Green: 20s) and proceed to **Node 9**.

#### **Node 8A: PRIORITY OVERRIDE / Preemptive Signal Control**
*   **Action**: Assigns Green Corridor exclusively for emergency routing.

---

### Phase 4: Signal Execution & Enforcement (Challan Gen)
#### **Node 9: TOOL NODE - Signal Execution Tool**
*   **Action**: Dispatches the timing plan computed in Node 7/8A to IoT signal controllers via local REST API.

#### **Node 10: TOOL NODE - Smart Enforcement Detection**
*   **Action**: Secondary vision loop that captures number plates ignoring signals or helmets.
*   **Detection Outputs**: `[{ "plate": "MH15AA1234", "offence": "Signal Jump" }]`

#### **Node 11: OUTPUT FORMATTER - Challan Generator (Firebase MCP)**
*   **Action**: Saves the challan automatically into Firestore to make it instantly visible on the Web App.
*   **MCP Tool Called**: `mcp_firebase-mcp-server_firestore_add_document`
*   **MCP Arguments**:
    ```json
    {
       "parent": "projects/traffic-optimization-1e1bd/databases/(default)/documents",
       "collectionId": "challans",
       "document": {
           "fields": {
             "vehicle_plate": { "stringValue": "MH15AA1234" },
             "offence": { "stringValue": "Signal Jump" },
             "amount": { "integerValue": "1000" }
           }
       }
    }
    ```

#### **Node 12: LLM STEP - Regional Communication Agent (Sarvam AI)**
*   **System Prompt**:
    > "You are MargVedha's Citizen Alert Agent. Generate a polite but urgent WhatsApp notification for citizens informing them about heavy congestion or Challans generated. Use English, Hindi, and Marathi text formats naturally structured."

#### **Node 13: OUTPUT FORMATTER - Final Dashboard Sink**
*   **Action**: Verifies all Dashboard nodes and metrics sync nicely using `firebase-mcp-server_firestore_update_document`.

---

### Phase 5: Feedback loops & Robust Fallback limits
#### **Node 14: EVALUATOR / GUARDRAIL - Safety Constraints**
*   **Safety Logic**:
    ```javascript
    export default function evaluate(signalPlan) {
        if(signalPlan.ns_green < 15) throw Error("Violates Minimum Pedestrian Safety Limit");
        return true;
    }
    ```

#### **Node 15: FAIL-SAFE ENGINE (Gauss-Seidel fallback)**
*   **Trigger**: If Node 14 fails or Node 7 throws an Exception.
*   **Execution**: Abandons AI timing and falls back to statutory historical timing rules.

#### **Node 16: MEMORY NODE - Deep Learning Store**
*   **Action**: Appends daily aggregate efficiency data for asynchronous retraining loops. Long Term execution logic runs via Firestore sub-collections using MCP.

#### **Node 17: LLM STEP - AI Performance Insights Agent**
*   **Action**: Queries Firebase logs via MCP and summarizes daily system performance for authorities.
*   **MCP Tool Called (To fetch Context)**: `mcp_firebase-mcp-server_firestore_query_collection` targeting "daily_aggregates".
*   **System Prompt**:
    > "Review the provided execution logs for the day. Highlight junctions with maximum fallback triggers. Write an executive summary detailing recommendations to adjust Q-learning exploration rates."

#### **Node 18 & 19: TRIGGER & NOTIFICATION**
*   **Node 18**: Retrains the Q-Model Weights when accuracy decays.
*   **Node 19**: Uses an SMTP tool to fire off the final Daily Admin Log generated by Node 17 directly to `police@nashikcity.gov.in`.
