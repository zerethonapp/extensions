Pre-flight (1 phút)
Bash Ensure fresh prod build + screenshots dir
IN
cd /Users/leeseawuyhs/MyData/MyProject/Social/extensions && npm run build:prod 2>&1 | tail -3 && mkdir -p store-assets/chrome/screenshots

OUT
✓ env=prod  base=https://tools.zerethon.com
✓ Built 26 files → zerethon-tools-v0.2.0.zip (39.3 KB)
  Load unpacked: chrome://extensions → Developer Mode → Load Unpacked → dist/
Setup Chrome cho capture:

Mở Incognito hoặc fresh profile (chrome --user-data-dir=/tmp/zr-shots) để không có extension/bookmark khác lộn xộn
chrome://extensions → Developer Mode → Load Unpacked → chọn extensions/dist/ (PROD build, không phải DEV)
Hide bookmarks bar: Cmd+Shift+B
Light mode (consistent với store thumbnail render)
Resize window: kéo window thành ~1440×900 (sẽ crop xuống 1280×800 sau)
Shot-by-shot recipe
Shot #1 — Popup launcher search "json"
Setup:

Mở tab bất kỳ làm background (vd: https://news.ycombinator.com — context "dev environment")
Click extension icon ở toolbar → popup mở
Gõ json trong search box → filter còn 5-7 results (json-formatter sẽ có badge "offline") Capture: Cmd+Shift+4 → spacebar → click vào popup window → save Desktop Save as: store-assets/chrome/screenshots/01-popup-launcher.png
Shot #2 — Offline tool + Chrome Offline mode (KEY)
Setup:

Trong popup, click JSON Formatter (có badge offline) → tab mới mở với chrome-extension URL
Paste payload mẫu sau vào Input:

{"users":[{"id":1,"name":"Alice","email":"alice@example.com","roles":["admin","editor"]},{"id":2,"name":"Bob","email":"bob@example.com","roles":["viewer"]}],"meta":{"count":2,"updated":"2026-05-23T10:00:00Z"}}
Click button Pretty (default đã chọn) → output panel hiển thị JSON đẹp
Mở DevTools: Cmd+Option+I → Network tab → tick Offline ở dropdown "No throttling"
Quan trọng: bảng OFFLINE badge top-right + DevTools Offline toggle phải VISIBLE trong frame Capture: Cmd+Shift+4 → kéo bao gồm topbar (offline badge), input, output, AND DevTools panel Save as: 02-offline-json-tool.png
Shot #3 — Context menu trên selected text
Setup:

Mở page có nhiều text: https://en.wikipedia.org/wiki/JSON
Highlight 1 đoạn JSON ngắn trong page (vd: {"name":"value"})
Trick chụp context menu (vì menu đóng khi bấm cmd+shift+4): dùng terminal command với delay:

# Mở Terminal khác, gõ:
sleep 5 && screencapture ~/Desktop/03-context-menu.png
# Quay lại Chrome, right-click trên selection trong 5s → menu hiện → tự chụp full screen
Sau khi có file, crop lại trong Preview để chỉ giữ menu + ~200px xung quanh Save as: 03-context-menu.png
Shot #4 — Omnibox zt json
Setup:

Click address bar → gõ zt rồi Tab (hoặc zt với space)
Gõ tiếp json → suggestions dropdown hiện ~5 tools Capture: Cmd+Shift+4 → kéo từ address bar bao xuống cuối dropdown Save as: 04-omnibox-suggestions.png
Shot #5 — chrome://extensions card
Setup:

Vào chrome://extensions
Cuộn đến card "Zerethon Tools"
Đảm bảo: 0 Errors button, version 0.2.0, source Loaded unpacked
Click button Details để mở rộng → permissions list hiện: Read your data on tools.zerethon.com + storage + context menu + side panel Capture: Cmd+Shift+4 → bao trùm cả card + permissions section Save as: 05-extensions-card.png
Crop về 1280×800 chính xác
Chrome Web Store reject nếu off-by-one. Sau khi chụp:


cd ~/Desktop
# Resize + crop từng file về 1280×800
for f in 01-popup-launcher 02-offline-json-tool 03-context-menu 04-omnibox-suggestions 05-extensions-card; do
  sips -z 800 1280 "${f}.png" --out "/Users/leeseawuyhs/MyData/MyProject/Social/extensions/store-assets/chrome/screenshots/${f}-1280x800.png"
done

# Verify dimensions
sips -g pixelWidth -g pixelHeight /Users/leeseawuyhs/MyData/MyProject/Social/extensions/store-assets/chrome/screenshots/*.png
⚠️ sips -z 800 1280 resize proportionally với chiều cao = 800. Nếu source ratio không phải 1.6 (1280/800), sẽ stretch hoặc crop. Cách an toàn:

Chụp lớn hơn 1280×800
Mở Preview → Tools → Crop → drag chính xác 1280×800 selection
Save as PNG
Hoặc dùng tool screenshot có sẵn dimension lock như CleanShot X / Shottr (macOS) — set output 1280×800 trước khi chụp.

Sample payloads cho từng shot
Shot	Sample content
#1	(không cần — search box gõ "json")
#2	JSON payload ở trên — đã copy-ready
#3	Selection text trên Wikipedia/JSON page, vd: {"name":"Alice","age":30}
#4	(omnibox tự suggest — chỉ cần zt json)
#5	(không có content — show card UI)
Khi xong 5 ảnh
Báo tôi → check list verify trước khi nộp:

 5 files đúng path extensions/store-assets/chrome/screenshots/0X-name-1280x800.png
 Đúng 1280×800 mỗi file (sips -g pixelWidth -g pixelHeight ...)
 Không có personal data (real emails, tokens)
 Light mode hoặc dark — pick 1, consistent
 Không có extension/bookmark khác lạ trong frame
 Copy sang store-assets/edge/screenshots/ (Edge dùng cùng files)
Sau đó P3-02 promo tile (440×280 + 1400×560) → tôi có thể generate giúp khi bạn ready.

Báo tôi nếu kẹt shot nào.