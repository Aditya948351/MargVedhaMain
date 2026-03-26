#!/usr/bin/env python3
"""
MargVedha 3.0: Standalone Traffic Counting Script
Processes a single video, counts vehicles, and saves annotated output.
"""

import os
import cv2
import json
import time
from collections import defaultdict
from ultralytics import YOLO
from tqdm import tqdm
from Main_code import FirebaseManager

def process_video(source_path, model_path, output_path, line_coords, firebase_cert=None):
    # Initialize Firebase if cert provided
    firebase_mgr = FirebaseManager(firebase_cert) if firebase_cert else None
    
    # Initialize YOLO Model
    print(f"Loading model: {model_path}")
    model = YOLO(model_path)
    
    # Open Video Source
    cap = cv2.VideoCapture(source_path)
    if not cap.isOpened():
        print(f"Error: Could not open video source {source_path}")
        return

    # Get video properties
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps    = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    if fps == 0: fps = 30 # Fallback
    
    # Initialize Video Writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    # Counting Logic State
    
    track_last_side = {}
    counts = {'incoming': defaultdict(int), 'outgoing': defaultdict(int)}
    target_names = ['car', 'bus', 'truck', 'motorcycle']
    
    # Line coordinates (x1, y1, x2, y2)
    lx1, ly1, lx2, ly2 = line_coords

    def get_side(pt):
        # (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1)
        val = (lx2 - lx1) * (pt[1] - ly1) - (ly2 - ly1) * (pt[0] - lx1)
        return 'A' if val > 0 else 'B'

    print(f"Processing video: {source_path} ({total_frames} frames)")
    
    # Use model.track for consistent results with BoT-SORT
    # We iterate frame by frame manually via the generator to allow custom drawing
    results = model.track(source=source_path, persist=True, tracker='botsort.yaml', stream=True, show=False)
    
    pbar = tqdm(total=total_frames, desc="Processing Frames")
    
    for i, r in enumerate(results):
        frame = r.orig_img.copy()
        
        # Draw the counting line
        cv2.line(frame, (lx1, ly1), (lx2, ly2), (0, 255, 255), 3)
        
        if r.boxes and r.boxes.id is not None:
            boxes = r.boxes.xyxy.cpu().numpy()
            ids = r.boxes.id.cpu().numpy().astype(int)
            clss = r.boxes.cls.cpu().numpy().astype(int)
            
            for box, tid, cls_idx in zip(boxes, ids, clss):
                cls_name = model.names[cls_idx]
                if cls_name not in target_names:
                    continue
                
                # Centroid
                cx, cy = int((box[0] + box[2]) / 2), int((box[1] + box[3]) / 2)
                
                # Tracking side
                current_side = get_side((cx, cy))
                prev_side = track_last_side.get(tid)
                track_last_side[tid] = current_side
                
                # Boundary crossing logic
                if prev_side is not None and prev_side != current_side:
                    # Side change!
                    if prev_side == 'A' and current_side == 'B':
                        direction = 'outgoing'
                    else:
                        direction = 'incoming'
                    
                    counts[direction][cls_name] += 1
                    
                    if firebase_mgr:
                        firebase_mgr.update_counts("cam1_standalone", counts)
                
                # Draw box and ID
                x1, y1, x2, y2 = map(int, box)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, f"{cls_name} {tid}", (x1, y1 - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Overlay Dashboard info
        overlay = frame.copy()
        cv2.rectangle(overlay, (10, 10), (350, 120), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.5, frame, 0.5, 0, frame)
        
        y_offset = 40
        for direction, dir_counts in counts.items():
            total = sum(dir_counts.values())
            text = f"{direction.upper()}: {total} vehicles"
            cv2.putText(frame, text, (20, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
            y_offset += 30
            
        # Periodic update
        if firebase_mgr and i % 30 == 0:
            firebase_mgr.update_counts("cam1_standalone", counts)

        # Write frame
        out.write(frame)
        pbar.update(1)
        
    pbar.close()
    cap.release()
    out.release()
    
    print("\n" + "="*30)
    print("FINAL COUNTS")
    print("="*30)
    for direction in ['incoming', 'outgoing']:
        print(f"{direction.upper()}:")
        for cls, count in counts[direction].items():
            print(f"  - {cls}: {count}")
    print("="*30)
    print(f"Output saved to: {output_path}")

if __name__ == "__main__":
    # Default parameters based on cam1_north config
    SOURCE = "data/cam1.mp4"
    WEIGHTS = "weights/yolov11m.pt"
    OUTPUT = "output_cam1.mp4"
    LINE = [0, 360, 1280, 360] # Horizontal line in the middle
    FIREBASE_CERT = "firebase-adminsdk.json"
    
    # Ensure directories exist
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    process_video(SOURCE, WEIGHTS, OUTPUT, LINE, firebase_cert=FIREBASE_CERT if os.path.exists(FIREBASE_CERT) else None)
