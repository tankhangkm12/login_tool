import cv2
import os
import sys

# === Xác định thư mục thực thi EXE (không phải Temp)
if getattr(sys, 'frozen', False):
    base_dir = os.path.dirname(sys.executable)  # Khi chạy từ EXE
else:
    base_dir = os.path.dirname(os.path.abspath(__file__))  # Khi chạy từ .py

# === Lưu ảnh tại thư mục bên cạnh EXE
output_path = os.path.join(base_dir,'..','Server_Control' ,'webcam_photo.png')

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Cannot access webcam.")
    sys.exit(1)

ret, frame = cap.read()
cap.release()

if not ret:
    print("Error: Failed to capture photo.")
    sys.exit(1)

cv2.imwrite(output_path, frame)
print(f"Saved: {output_path}")
