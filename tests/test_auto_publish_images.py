import importlib.util
import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "wechat-article" / "scripts" / "auto_publish.py"


spec = importlib.util.spec_from_file_location("auto_publish", MODULE_PATH)
auto_publish = importlib.util.module_from_spec(spec)
spec.loader.exec_module(auto_publish)


class AutoPublishImageTests(unittest.TestCase):
    def setUp(self):
        self.original_upload = auto_publish.upload_content_image
        self.uploaded = []
        auto_publish.upload_content_image = lambda token, url: "https://mmbiz.qpic.cn/" + url.rsplit("/", 1)[-1]

    def tearDown(self):
        auto_publish.upload_content_image = self.original_upload

    def test_rewrites_html_img_and_svg_image_href(self):
        html = (
            '<section><img src="https://example.com/a.jpg">'
            '<svg><image href="https://example.com/b.png"></image></svg></section>'
        )
        out = auto_publish.process_html_images("token", html)
        self.assertIn('src="https://mmbiz.qpic.cn/a.jpg"', out)
        self.assertIn('href="https://mmbiz.qpic.cn/b.png"', out)

    def test_rewrites_xlink_href_attribute_name(self):
        html = '<svg><image xlink:href="https://example.com/c.png"></image></svg>'
        out = auto_publish.process_html_images("token", html)
        self.assertNotIn("xlink:href", out)
        self.assertIn('href="https://mmbiz.qpic.cn/c.png"', out)

    def test_rejects_data_uri(self):
        with self.assertRaises(ValueError):
            auto_publish.process_html_images("token", '<svg><image href="data:image/png;base64,aaa"></image></svg>')

    def test_rejects_data_uri_in_html_img(self):
        with self.assertRaises(ValueError):
            auto_publish.process_html_images("token", '<img src="DATA:image/png;base64,aaa">')

    def test_rejects_protocol_relative_url(self):
        with self.assertRaises(ValueError):
            auto_publish.process_html_images("token", '<img src="//example.com/a.png">')

    def test_rejects_relative_image_url(self):
        with self.assertRaises(ValueError):
            auto_publish.process_html_images("token", '<img src="images/a.jpg">')

    def test_rejects_non_https_wechat_cdn(self):
        with self.assertRaises(ValueError):
            auto_publish.process_html_images("token", '<img src="http://mmbiz.qpic.cn/a.jpg">')

    def test_does_not_rewrite_non_image_xlink(self):
        html = '<svg><use xlink:href="#shape"></use><image xlink:href="https://example.com/a.png"></image></svg>'
        out = auto_publish.process_html_images("token", html)
        self.assertIn('use xlink:href="#shape"', out)
        self.assertIn('image href="https://mmbiz.qpic.cn/a.png"', out)

    def test_existing_wechat_cdn_is_not_reuploaded(self):
        calls = []
        auto_publish.upload_content_image = lambda token, url: calls.append(url) or "https://mmbiz.qpic.cn/new.jpg"
        html = '<img src="https://mmbiz.qpic.cn/already.jpg">'
        out = auto_publish.process_html_images("token", html)
        self.assertEqual(out, html)
        self.assertEqual(calls, [])

    def test_upload_failure_raises(self):
        auto_publish.upload_content_image = lambda token, url: None
        with self.assertRaises(ValueError):
            auto_publish.process_html_images("token", '<img src="https://example.com/a.jpg">')


if __name__ == "__main__":
    unittest.main()
