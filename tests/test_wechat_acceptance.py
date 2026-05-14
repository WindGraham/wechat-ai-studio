import importlib.util
import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "wechat-article" / "scripts" / "wechat_acceptance.py"


spec = importlib.util.spec_from_file_location("wechat_acceptance", MODULE_PATH)
wechat_acceptance = importlib.util.module_from_spec(spec)
spec.loader.exec_module(wechat_acceptance)


class WeChatAcceptanceTests(unittest.TestCase):
    def test_manual_paste_accepts_https_image(self):
        report = wechat_acceptance.build_report('<section><img src="https://example.com/a.jpg"></section>', "manual-paste")
        self.assertTrue(report["ok"])

    def test_api_requires_wechat_cdn_images(self):
        report = wechat_acceptance.build_report('<section><img src="https://example.com/a.jpg"></section>', "api-draft")
        self.assertFalse(report["ok"])
        self.assertIn("api-img-not-wechat-cdn", {item["code"] for item in report["issues"]})

    def test_rejects_relative_and_data_images(self):
        report = wechat_acceptance.build_report('<img src="images/a.jpg"><svg><image href="data:image/png;base64,aaa"></image></svg>', "manual-paste")
        self.assertFalse(report["ok"])
        codes = {item["code"] for item in report["issues"]}
        self.assertIn("non-public-img-src", codes)
        self.assertIn("data-uri", codes)
        self.assertIn("svg-image-not-https", codes)

    def test_rejects_complex_svg_and_grid(self):
        html = '<section style="display:grid"><svg><filter></filter><foreignObject></foreignObject><animateTransform type="matrix"></animateTransform></svg></section>'
        report = wechat_acceptance.build_report(html, "manual-paste")
        self.assertFalse(report["ok"])
        codes = {item["code"] for item in report["issues"]}
        self.assertIn("grid-layout", codes)
        self.assertIn("svg-filter", codes)
        self.assertIn("svg-foreign-object", codes)
        self.assertIn("svg-animate-transform-matrix", codes)

    def test_accepts_safe_smil_svg_with_wechat_cdn_image(self):
        html = '''
        <section>
          <svg viewBox="0 0 375 80">
            <image href="https://mmbiz.qpic.cn/example.jpg" width="120" height="80">
              <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"></animate>
              <animateTransform attributeName="transform" type="translate" values="0,0;20,0;0,0" dur="2s" repeatCount="indefinite"></animateTransform>
            </image>
          </svg>
        </section>
        '''
        report = wechat_acceptance.build_report(html, "api-draft")
        self.assertTrue(report["ok"], report["issues"])


if __name__ == "__main__":
    unittest.main()
