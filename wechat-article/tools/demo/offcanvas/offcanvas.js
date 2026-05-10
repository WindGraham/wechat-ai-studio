(function () {
  'use strict'

  document.querySelector('[data-bs-toggle="侧边栏"]').addEventListener('click', function () {
    document.querySelector('.offcanvas-collapse').classList.toggle('open')
  })
})()
