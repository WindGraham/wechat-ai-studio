#!/usr/bin/env python3
"""
WeChat Editor Playwright Injector
通过 Playwright 控制 Edge/Chromium，将 HTML 注入微信公众号后台编辑器
"""

import os
import time
import json

HTML_CONTENT = """<section style="max-width: 375px; margin-left: auto; margin-right: auto; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing: border-box;">
  <section style="background: #1a1a2e; padding: 24px 20px; text-align: center;">
    <h1 style="color: #e94560; font-size: 20px; margin: 0 0 8px; line-height: 1.4;">Playwright 注入测试</h1>
    <p style="color: #a0a0b0; font-size: 13px; margin: 0; line-height: 1.5;">这是一段通过 Playwright 直接注入编辑器的内容</p>
  </section>
  <section style="padding: 20px;">
    <p style="color: #555; font-size: 14px; line-height: 1.7; margin: 0;">
      如果看到这段文字，说明 Playwright 无损注入成功。
    </p>
  </section>
</section>"""

COOKIE_FILE = "/tmp/wechat_cookies.json"

def save_cookies(context):
    cookies = context.cookies()
    with open(COOKIE_FILE, "w") as f:
        json.dump(cookies, f)
    print(f"[INFO] Cookies 已保存到 {COOKIE_FILE}")

def load_cookies(context):
    if os.path.exists(COOKIE_FILE):
        with open(COOKIE_FILE, "r") as f:
            cookies = json.load(f)
        context.add_cookies(cookies)
        print("[INFO] 已加载保存的 cookies")
        return True
    return False

def wait_for_login(page, timeout=120000):
    print("[INFO] 检测登录状态...")
    time.sleep(3)
    
    if "/cgi-bin/home" in page.url or "/cgi-bin/appmsg" in page.url:
        print("[INFO] 已登录！")
        return True
    
    try:
        relogin = page.query_selector('text=重新登录')
        if relogin:
            print("[INFO] 点击'重新登录'...")
            relogin.click()
            time.sleep(2)
    except Exception:
        pass
    
    print("[INFO] 请扫码登录，脚本等待 120 秒...")
    try:
        page.wait_for_url(lambda url: "/cgi-bin/home" in url or "/cgi-bin/appmsg" in url, timeout=timeout)
        print("[INFO] 登录成功！")
        return True
    except Exception:
        print("[ERROR] 登录超时")
        return False

def navigate_to_editor(page):
    """从首页导航到图文编辑器"""
    print("[INFO] 正在进入图文编辑器...")
    
    # 策略 1: 直接访问内容管理页
    page.goto("https://mp.weixin.qq.com/cgi-bin/appmsg?begin=0&count=10&t=media/appmsg_list&type=10&action=list", wait_until="networkidle")
    time.sleep(3)
    page.screenshot(path="/tmp/wechat_content_list.png", full_page=False)
    print("[INFO] 内容管理页截图: /tmp/wechat_content_list.png")
    
    # 尝试点击"新的创作"或"新建图文"按钮
    # 微信后台通常是：点击"新的创作" -> 弹出/跳转到编辑器
    new_btn_selectors = [
        'text=新的创作',
        'text=新建图文',
        'text=新建图文消息',
        'text=图文消息',
        '.js_create',
        '.create_btn',
        '[data-id="create"]',
        'a:has-text("图文")',
        'button:has-text("新建")',
        '.weui-desktop-btn:has-text("创作")',
        '.weui-desktop-btn:has-text("新建")',
    ]
    
    for selector in new_btn_selectors:
        try:
            btn = page.query_selector(selector)
            if btn:
                print(f"[INFO] 点击按钮: {selector}")
                btn.click()
                time.sleep(5)
                break
        except Exception as e:
            print(f"[WARN] 点击 {selector} 失败: {e}")
    
    # 点击后可能进入草稿箱，需要再次点击"新的创作"（带 + 号）
    # 或者可能直接弹出编辑器
    time.sleep(3)
    page.screenshot(path="/tmp/wechat_editor_state.png", full_page=False)
    print("[INFO] 编辑器页截图: /tmp/wechat_editor_state.png")
    
    # 检查当前 URL 和页面内容
    current_url = page.url
    print(f"[INFO] 当前 URL: {current_url}")
    
    # 如果还在草稿箱/列表页，需要再点击一次"新的创作"新建文章
    if "appmsg_list" in current_url or "draft" in current_url or page.query_selector('text=草稿箱'):
        print("[INFO] 当前在草稿箱页面，点击'新的创作'新建文章...")
        try:
            # 找带 + 号的"新的创作"按钮
            create_btn = page.query_selector('.weui-desktop-btn:has-text("新的创作")') or \
                        page.query_selector('text=新的创作') or \
                        page.query_selector('.create_article_btn') or \
                        page.query_selector('[title="新的创作"]')
            if create_btn:
                create_btn.click()
                print("[INFO] 已点击'新的创作'")
                time.sleep(8)
            else:
                # 尝试直接访问新建 URL
                print("[INFO] 未找到创建按钮，尝试直接访问新建 URL...")
                page.goto("https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit_v2&isNew=1&type=10&createType=10", wait_until="networkidle")
                time.sleep(5)
        except Exception as e:
            print(f"[WARN] 点击失败: {e}")
    
    # 最终检查
    page.screenshot(path="/tmp/wechat_editor_state.png", full_page=False)
    final_url = page.url
    print(f"[INFO] 最终 URL: {final_url}")
    
    if "appmsg_edit" in final_url:
        print("[INFO] 已进入编辑器页面")
        return True
    else:
        print(f"[WARN] 未确认进入编辑器，当前 URL: {final_url}")
        # 再试一次直接访问
        page.goto("https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit_v2&isNew=1&type=10&createType=10", wait_until="networkidle")
        time.sleep(5)
        page.screenshot(path="/tmp/wechat_editor_state.png", full_page=False)
        if "appmsg_edit" in page.url:
            print("[INFO] 通过直接 URL 进入编辑器")
            return True
        return False

def inject_html(page, html):
    print("[INFO] 正在尝试注入 HTML...")
    
    # 策略 1: iframe (UEditor)
    try:
        iframe = page.query_selector('iframe#ueditor_0')
        if iframe:
            frame = iframe.content_frame()
            if frame:
                frame.evaluate(f'document.body.innerHTML = `{html}`')
                print("[SUCCESS] UEditor iframe 注入成功！")
                return True
    except Exception as e:
        print(f"[WARN] UEditor 失败: {e}")
    
    # 策略 2: contenteditable
    try:
        editable = page.query_selector('div[contenteditable="true"]')
        if editable:
            page.evaluate(f'''
                (html) => {{
                    document.querySelector('div[contenteditable="true"]').innerHTML = html;
                    return true;
                }}
            ''', html)
            print("[SUCCESS] contenteditable 注入成功！")
            return True
    except Exception as e:
        print(f"[WARN] contenteditable 失败: {e}")
    
    # 策略 3: ProseMirror
    try:
        pm = page.query_selector('.ProseMirror')
        if pm:
            page.evaluate(f'''
                (html) => {{
                    document.querySelector('.ProseMirror').innerHTML = html;
                    return true;
                }}
            ''', html)
            print("[SUCCESS] ProseMirror 注入成功！")
            return True
    except Exception as e:
        print(f"[WARN] ProseMirror 失败: {e}")
    
    # 策略 4: 通用容器
    for sel in ['#js_editor', '.mpeditor_container', '.editor_container', '#editor', '.rich_media_content']:
        try:
            el = page.query_selector(sel)
            if el:
                page.evaluate(f'''
                    (html) => {{
                        const el = document.querySelector('{sel}');
                        if (el) {{ el.innerHTML = html; return true; }}
                        return false;
                    }}
                ''', html)
                print(f"[SUCCESS] {sel} 注入成功！")
                return True
        except Exception as e:
            print(f"[WARN] {sel} 失败: {e}")
    
    # 策略 5: 全局 API
    try:
        result = page.evaluate(f'''
            (html) => {{
                if (window.UE && window.UE.instants) {{
                    for (let key in window.UE.instants) {{
                        let editor = window.UE.instants[key];
                        if (editor && editor.setContent) {{
                            editor.setContent(html);
                            return "UEditor API";
                        }}
                    }}
                }}
                return null;
            }}
        ''', html)
        if result:
            print(f"[SUCCESS] {result} 注入成功！")
            return True
    except Exception as e:
        print(f"[WARN] 全局 API 失败: {e}")
    
    print("[ERROR] 所有注入策略都失败了")
    return False

def main(use_edge=True, headless=False):
    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        if use_edge:
            edge_path = "/usr/bin/microsoft-edge-stable"
            user_data_dir = os.path.expanduser("~/.config/microsoft-edge/")
            print(f"[INFO] 启动 Edge，profile: {user_data_dir}")
            try:
                context = p.chromium.launch_persistent_context(
                    user_data_dir=user_data_dir,
                    executable_path=edge_path,
                    headless=headless,
                    args=["--no-first-run", "--no-default-browser-check"]
                )
                print("[INFO] Edge 启动成功")
            except Exception as e:
                print(f"[ERROR] Edge 失败: {e}，回退到 Chromium")
                browser = p.chromium.launch(headless=headless)
                context = browser.new_context()
                load_cookies(context)
                use_edge = False
        else:
            browser = p.chromium.launch(headless=headless)
            context = browser.new_context()
            load_cookies(context)

        page = context.new_page()
        page.goto("https://mp.weixin.qq.com/", wait_until="domcontentloaded")
        
        if not wait_for_login(page):
            return False
        
        save_cookies(context)
        
        if not navigate_to_editor(page):
            print("[ERROR] 无法进入编辑器")
            return False
        
        injected = inject_html(page, HTML_CONTENT)
        
        time.sleep(2)
        page.screenshot(path="/tmp/wechat_editor_after_inject.png", full_page=False)
        print("[INFO] 最终截图: /tmp/wechat_editor_after_inject.png")
        
        # 设置标题
        try:
            title = page.query_selector('input[name="title"], #title, .js_title')
            if title:
                title.fill("Playwright 注入测试")
                print("[INFO] 标题已设置")
        except Exception as e:
            print(f"[WARN] 标题失败: {e}")
        
        if injected:
            print("[SUCCESS] 注入完成！")
        else:
            print("[WARN] 注入失败，请检查截图并告诉我编辑器结构")
        
        print("[INFO] 浏览器保持打开，按 Enter 关闭...")
        try:
            input()
        except EOFError:
            pass
        
        if use_edge:
            context.close()
        else:
            browser.close()
        
        return injected

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--chromium", action="store_true")
    parser.add_argument("--headless", action="store_true")
    args = parser.parse_args()
    main(use_edge=not args.chromium, headless=args.headless)
