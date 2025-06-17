import tkinter as tk
import sys
from PIL import Image, ImageTk
import keyboard  # pip install keyboard
import os
import json

# Load credentials from JSON
def load_credentials(json_path="D:\\foolishPlay\\Private\\ControlComputer\\credentials.json"):
    try:
        with open(json_path, "r") as file:
            data = json.load(file)
            print(data['username'], data['password'])
            return data.get("username"), data.get("password")
    except Exception as e:
        print(f"❌ Failed to load credentials: {e}")
        sys.exit(1)

CORRECT_USERNAME, CORRECT_PASSWORD = load_credentials()

def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)

# Create window
root = tk.Tk()
root.title("Login")
root.overrideredirect(True)
screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()
root.geometry(f"{screen_width}x{screen_height}+0+0")
root.configure(bg="black")
root.attributes("-topmost", True)

# Load background image
background_image = Image.open(resource_path("ControlComputer\\assets\\anime.background.jpg"))
background_image = background_image.resize((screen_width, screen_height))
bg_photo = ImageTk.PhotoImage(background_image)

bg_label = tk.Label(root, image=bg_photo)
bg_label.place(x=0, y=0, relwidth=1, relheight=1)

# Variables
username_var = tk.StringVar()
password_var = tk.StringVar()

# Login Frame (hidden initially)
login_frame = tk.Frame(root, bg="#06fb2f", bd=2, relief="solid",padx=10)
login_frame.place_forget()

title_label = tk.Label(login_frame, text="LOGIN", font=("Arial", 24, "bold"), fg="white", bg="#06fb2f")
title_label.pack(pady=(10, 20))

username_entry = tk.Entry(login_frame, textvariable=username_var, font=("Arial", 16), justify='center')
username_entry.pack(pady=10, ipadx=10, ipady=5)

password_entry = tk.Entry(login_frame, textvariable=password_var, font=("Arial", 16), show="*", justify='center')
password_entry.pack(pady=10, ipadx=10, ipady=5)

error_label = tk.Label(login_frame, text="", fg="red", bg="#06fb2f", font=("Arial", 12))
error_label.pack(pady=5)

def unlock():
    if username_var.get() == CORRECT_USERNAME and password_var.get() == CORRECT_PASSWORD:
        root.destroy()
        sys.exit()
    else:
        error_label.config(text="Wrong username or password!")
        password_var.set("")

def on_enter(event=None):
    unlock()


login_button = tk.Button(login_frame, text="Login", font=("Arial", 14), bg="#007acc", fg="white", command=unlock,cursor='hand2')
login_button.pack(pady=(10, 20), ipadx=10, ipady=5)

root.bind('<Return>', on_enter)

# Show login on click
def show_login(event):
    login_frame.place(relx=0.5, rely=0.5, anchor="center")
    username_entry.focus_set()
    root.unbind("<Button-1>")

root.bind("<Button-1>", show_login)

# Disable system keys
def disable_system_keys():
    keys_to_block = ['alt', 'tab', 'windows', 'esc', 'ctrl', 'f4']
    for key in keys_to_block:
        try:
            keyboard.block_key(key)
        except:
            pass

disable_system_keys()

root.mainloop()
