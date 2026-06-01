"""Kedem Tours backend — Python 3, no third-party dependencies."""
import json, os, smtplib, pathlib
from http.server import HTTPServer, SimpleHTTPRequestHandler
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from urllib.parse import urlparse
from datetime import datetime

PORT          = 3000
ORDERS_FILE   = pathlib.Path(__file__).parent / "data" / "orders.json"
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "kedem2024admin")
ADMIN_TOKEN   = __import__("base64").b64encode(ADMIN_PASSWORD.encode()).decode()

# Gmail credentials — set env vars or edit below
EMAIL_USER = os.environ.get("EMAIL_USER", "amtguide@gmail.com")
EMAIL_PASS = os.environ.get("EMAIL_PASS", "")   # App Password from Google Account

def load_orders():
    if not ORDERS_FILE.exists():
        return []
    try:
        return json.loads(ORDERS_FILE.read_text("utf-8"))
    except Exception:
        return []

def save_orders(orders):
    ORDERS_FILE.parent.mkdir(parents=True, exist_ok=True)
    ORDERS_FILE.write_text(json.dumps(orders, ensure_ascii=False, indent=2), "utf-8")

def send_email(order):
    if not EMAIL_PASS:
        return
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Новый заказ — {order['excursion']}"
    msg["From"]    = EMAIL_USER
    msg["To"]      = "amtguide@gmail.com"
    html = f"""
    <h2 style="color:#0f3460">Новый заказ на экскурсию</h2>
    <table style="border-collapse:collapse;width:100%;max-width:500px;font-family:sans-serif">
      <tr><td style="padding:8px;border:1px solid #ddd;background:#f8f9fa"><b>Экскурсия</b></td>
          <td style="padding:8px;border:1px solid #ddd">{order['excursion']}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;background:#f8f9fa"><b>Имя</b></td>
          <td style="padding:8px;border:1px solid #ddd">{order['firstName']} {order['lastName']}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;background:#f8f9fa"><b>Телефон</b></td>
          <td style="padding:8px;border:1px solid #ddd">{order['phone']}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;background:#f8f9fa"><b>Мест</b></td>
          <td style="padding:8px;border:1px solid #ddd">{order['seats']}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;background:#f8f9fa"><b>Место посадки</b></td>
          <td style="padding:8px;border:1px solid #ddd">{order['pickup']}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;background:#f8f9fa"><b>Дата заказа</b></td>
          <td style="padding:8px;border:1px solid #ddd">{order['date']}</td></tr>
    </table>"""
    msg.attach(MIMEText(html, "html", "utf-8"))
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as s:
            s.login(EMAIL_USER, EMAIL_PASS)
            s.sendmail(EMAIL_USER, "amtguide@gmail.com", msg.as_string())
    except Exception as e:
        print(f"Email error: {e}")

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(pathlib.Path(__file__).parent / "public"), **kwargs)

    def log_message(self, fmt, *args):
        print(fmt % args)

    def send_json(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", len(body))
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(length).decode("utf-8")) if length else {}

    def check_auth(self):
        auth = self.headers.get("Authorization", "")
        return auth == f"Bearer {ADMIN_TOKEN}"

    def do_POST(self):
        path = urlparse(self.path).path

        if path == "/api/order":
            body = self.read_json_body()
            required = ["firstName","lastName","phone","seats","pickup","excursion"]
            if not all(body.get(k,"").strip() if isinstance(body.get(k), str) else body.get(k) for k in required):
                return self.send_json(400, {"error": "Заполните все поля"})
            order = {
                "id":        int(datetime.now().timestamp() * 1000),
                "date":      datetime.now().isoformat(),
                "excursion": body["excursion"],
                "firstName": body["firstName"],
                "lastName":  body["lastName"],
                "phone":     body["phone"],
                "seats":     int(body["seats"]),
                "pickup":    body["pickup"],
            }
            orders = load_orders()
            orders.append(order)
            save_orders(orders)
            send_email(order)
            return self.send_json(200, {"success": True, "orderId": order["id"]})

        if path == "/api/admin/login":
            body = self.read_json_body()
            if body.get("password") == ADMIN_PASSWORD:
                return self.send_json(200, {"success": True, "token": ADMIN_TOKEN})
            return self.send_json(401, {"error": "Неверный пароль"})

        self.send_json(404, {"error": "Not found"})

    def do_DELETE(self):
        path = urlparse(self.path).path
        if path.startswith("/api/admin/orders/"):
            if not self.check_auth():
                return self.send_json(401, {"error": "Unauthorized"})
            try:
                oid = int(path.split("/")[-1])
                orders = [o for o in load_orders() if o["id"] != oid]
                save_orders(orders)
                return self.send_json(200, {"success": True})
            except Exception:
                return self.send_json(400, {"error": "Bad request"})
        self.send_json(404, {"error": "Not found"})

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/admin/orders":
            if not self.check_auth():
                return self.send_json(401, {"error": "Unauthorized"})
            return self.send_json(200, load_orders())
        super().do_GET()

if __name__ == "__main__":
    print(f"Kedem Tours running on http://localhost:{PORT}")
    print(f"Admin password: {ADMIN_PASSWORD}")
    print(f"Orders file: {ORDERS_FILE}")
    HTTPServer(("", PORT), Handler).serve_forever()
