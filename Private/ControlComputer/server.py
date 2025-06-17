import tkinter as tk
import sys
import os
import json
import keyboard
from PIL import Image, ImageTk

# ----------- Helper: Get resource path (for .exe or dev mode) -----------
def resource_path(relative_path=""):
    base_path = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable if getattr(sys, 'frozen', False) else __file__))
    return os.path.join(base_path, relative_path)

# ----------- Load credentials -----------
def load_credentials(json_path=None):
    try:
        if json_path is None:
            json_path = os.path.join(os.path.dirname(sys.executable if getattr(sys, 'frozen', False) else __file__),
                                      "accounts", "credentials.json")
            print(json_path)
        with open(json_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data.get("username"), data.get("password")
    except Exception as e:
        sys.exit(1)

CORRECT_USERNAME, CORRECT_PASSWORD = load_credentials()

# ----------- Create main window -----------
root = tk.Tk()
root.title("Login")
root.overrideredirect(True)
screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()
root.geometry(f"{screen_width}x{screen_height}+0+0")
root.configure(bg="black")
root.attributes("-topmost", True)

# ----------- Load background image -----------
try:
    img_path = os.path.join(os.path.dirname(sys.executable if getattr(sys, 'frozen', False) else __file__),
                            "assets", "anime.background.jpg")
    print(img_path)
    background_image = Image.open(img_path)
    background_image = background_image.resize((screen_width, screen_height))
    bg_photo = ImageTk.PhotoImage(background_image)
except Exception as e:
    sys.exit(1)

bg_label = tk.Label(root, image=bg_photo)
bg_label.place(x=0, y=0, relwidth=1, relheight=1)

# ----------- Variables and UI -----------
username_var = tk.StringVar()
password_var = tk.StringVar()

login_frame = tk.Frame(root, bg="#06fb2f", bd=2, relief="solid", padx=10)
login_frame.place_forget()

tk.Label(login_frame, text="LOGIN", font=("Arial", 24, "bold"), fg="white", bg="#06fb2f").pack(pady=(10, 20))

tk.Entry(login_frame, textvariable=username_var, font=("Arial", 16), justify='center').pack(pady=10, ipadx=10, ipady=5)
tk.Entry(login_frame, textvariable=password_var, font=("Arial", 16), show="*", justify='center').pack(pady=10, ipadx=10, ipady=5)

error_label = tk.Label(login_frame, text="", fg="red", bg="#06fb2f", font=("Arial", 12))
error_label.pack(pady=5)

def unlock():
    if username_var.get() == CORRECT_USERNAME and password_var.get() == CORRECT_PASSWORD:
        root.destroy()
        sys.exit()
    else:
        error_label.config(text="❌ Wrong username or password!")
        password_var.set("")

def on_enter(event=None):
    unlock()

tk.Button(login_frame, text="Login", font=("Arial", 14), bg="#007acc", fg="white",
          command=unlock, cursor='hand2').pack(pady=(10, 20), ipadx=10, ipady=5)

root.bind('<Return>', on_enter)

# ----------- Show login UI on mouse click -----------
def show_login(event):
    login_frame.place(relx=0.5, rely=0.5, anchor="center")
    root.unbind("<Button-1>")
    username_var.set("")
    password_var.set("")
    error_label.config(text="")
    root.after(100, lambda: root.focus_force())

root.bind("<Button-1>", show_login)

# ----------- Block system keys (may not work on all systems) -----------
def disable_system_keys():
    keys_to_block = ['alt', 'tab', 'windows', 'esc', 'ctrl', 'f4']
    for key in keys_to_block:
        try:
            keyboard.block_key(key)
        except:
            pass

disable_system_keys()

# ----------- Start -----------
root.mainloop()
