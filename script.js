/* ==========================================================================
   京东物流首页复刻 · script.js
   原生 JavaScript · 无任何依赖
   模块：吸顶导航 / Mega Menu / 轮播 / 移动端抽屉 / 折叠菜单
        数字滚动 / 滚动显现 / 表单演示 / 回到顶部 / Toast
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (selector, context) {
    return (context || document).querySelector(selector);
  };
  var $$ = function (selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     01. 吸顶导航状态 + 回到顶部
     ------------------------------------------------------------------------ */
  var header = $('#siteHeader');
  var backTop = $('#backTop');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (backTop) backTop.classList.toggle('is-visible', y > 620);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------------
     02. Toast 轻提示
     ------------------------------------------------------------------------ */
  var toast = $('#toast');
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2800);
  }

  $$('[data-demo]').forEach(function (el) {
    el.addEventListener('click', function (event) {
      event.preventDefault();
      showToast('演示站点：' + (el.getAttribute('data-demo') || '该') + '页面未包含在本次作业中。');
    });
  });

  /* ------------------------------------------------------------------------
     03. 搜索与快递查询（演示）
     ------------------------------------------------------------------------ */
  var searchForm = $('#headerSearch');
  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = $('#searchInput');
      var value = input ? input.value.trim() : '';
      if (!value) {
        showToast('请输入要搜索的服务或解决方案。');
        if (input) input.focus();
        return;
      }
      showToast('演示站点：已收到搜索「' + value + '」，搜索结果页未接入。');
    });
  }

  var trackForm = $('#trackForm');
  if (trackForm) {
    trackForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = $('#trackInput');
      var value = input ? input.value.trim() : '';
      if (!value) {
        showToast('请输入运单号或手机号后再查询。');
        if (input) input.focus();
        return;
      }
      showToast('演示站点：正在查询「' + value + '」，物流轨迹接口未接入。');
    });
  }

  var searchToggle = $('#searchToggle');
  if (searchToggle) {
    searchToggle.addEventListener('click', function () {
      openDrawer();
      window.setTimeout(function () {
        var input = $('#drawerSearchInput');
        if (input) input.focus();
      }, 420);
    });
  }

  $$('[data-focus-tracker]').forEach(function (link) {
    link.addEventListener('click', function () {
      window.setTimeout(function () {
        var input = $('#trackInput');
        if (input) input.focus({ preventScroll: true });
      }, 560);
    });
  });

  /* ------------------------------------------------------------------------
     04. 桌面端 Mega Menu 可访问性状态
     ------------------------------------------------------------------------ */
  $$('.has-mega').forEach(function (item) {
    var trigger = $('.nav-link', item);
    var closeTimer = null;

    function setOpen(open) {
      item.classList.toggle('is-open', open);
      if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    item.addEventListener('mouseenter', function () {
      window.clearTimeout(closeTimer);
      setOpen(true);
    });

    item.addEventListener('mouseleave', function () {
      closeTimer = window.setTimeout(function () {
        if (!item.contains(document.activeElement)) setOpen(false);
      }, 140);
    });

    item.addEventListener('focusin', function () {
      setOpen(true);
    });

    item.addEventListener('focusout', function (event) {
      if (!item.contains(event.relatedTarget)) setOpen(false);
    });

    item.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        if (trigger) trigger.focus();
        setOpen(false);
      }
    });
  });

  /* ------------------------------------------------------------------------
     05. 移动端抽屉 + 焦点管理
     ------------------------------------------------------------------------ */
  var navToggle = $('#navToggle');
  var drawer = $('#mobileDrawer');
  var backdrop = $('#drawerBackdrop');
  var drawerClose = $('#drawerClose');
  var lastFocused = null;
  var pageRegions = [
    $('.topbar'),
    $('.site-header'),
    $('main'),
    $('footer'),
    $('.float-actions')
  ].filter(Boolean);

  function setPageInert(on) {
    pageRegions.forEach(function (region) {
      if (on) region.setAttribute('inert', '');
      else region.removeAttribute('inert');
    });
  }

  function openDrawer() {
    if (!drawer) return;
    lastFocused = document.activeElement;
    drawer.classList.add('is-open');
    if (backdrop) backdrop.classList.add('is-visible');
    drawer.setAttribute('aria-hidden', 'false');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', '关闭菜单');
    }
    if (searchToggle) {
      searchToggle.setAttribute('aria-expanded', 'true');
      searchToggle.setAttribute('aria-label', '关闭搜索');
    }
    document.body.classList.add('menu-open');
    setPageInert(true);
    window.setTimeout(function () {
      if (drawerClose) drawerClose.focus();
    }, 80);
  }

  function closeDrawer() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    if (backdrop) backdrop.classList.remove('is-visible');
    drawer.setAttribute('aria-hidden', 'true');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', '打开菜单');
    }
    if (searchToggle) {
      searchToggle.setAttribute('aria-expanded', 'false');
      searchToggle.setAttribute('aria-label', '打开搜索');
    }
    document.body.classList.remove('menu-open');
    setPageInert(false);
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (drawer && drawer.classList.contains('is-open')) closeDrawer();
      else openDrawer();
    });
  }
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  if (drawer) {
    drawer.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab' || !drawer.classList.contains('is-open')) return;
      var focusables = $$(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        drawer
      ).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    $$('a[href^="#"]', drawer).forEach(function (link) {
      link.addEventListener('click', function () {
        closeDrawer();
      });
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  var desktopQuery = window.matchMedia('(min-width: 993px)');
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', function (event) {
      if (event.matches) closeDrawer();
    });
  }

  /* ------------------------------------------------------------------------
     06. 移动端折叠菜单
     ------------------------------------------------------------------------ */
  $$('.acc').forEach(function (acc) {
    var trigger = $('.acc__trigger', acc);
    var panel = $('.acc__panel', acc);
    if (!trigger || !panel) return;

    function setAccordion(open) {
      acc.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) panel.removeAttribute('inert');
      else panel.setAttribute('inert', '');
    }

    setAccordion(false);
    trigger.addEventListener('click', function () {
      setAccordion(!acc.classList.contains('is-open'));
    });
  });

  var drawerSearch = $('#drawerSearch');
  if (drawerSearch) {
    drawerSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = $('#drawerSearchInput');
      var value = input ? input.value.trim() : '';
      if (!value) {
        showToast('请输入要搜索的服务或解决方案。');
        return;
      }
      showToast('演示站点：已收到搜索「' + value + '」，搜索结果页未接入。');
    });
  }

  /* ------------------------------------------------------------------------
     07. 首屏轮播
     ------------------------------------------------------------------------ */
  var hero = $('.hero');
  if (hero) {
    var slides = $$('.hero-slide', hero);
    var dots = $$('.hero__dot', hero);
    var currentLabel = $('#heroCurrent');
    var prevBtn = $('#heroPrev');
    var nextBtn = $('#heroNext');
    var pauseBtn = $('#heroPause');
    var pauseIcon = $('#heroPauseIcon');
    var heroStatus = $('#heroStatus');
    var slideIndex = 0;
    var carouselTimer = null;
    var carouselPaused = false;
    var userPaused = false;
    var INTERVAL = 6500;

    function goTo(index, userInitiated) {
      if (!slides.length) return;
      slideIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        var active = i === slideIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      dots.forEach(function (dot, i) {
        var active = i === slideIndex;
        dot.classList.toggle('is-active', active);
        if (active) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });

      if (currentLabel) {
        currentLabel.textContent = String(slideIndex + 1).padStart(2, '0');
      }

      if (userInitiated && heroStatus) {
        var title = slides[slideIndex].getAttribute('data-title') || '';
        heroStatus.textContent =
          '第 ' + (slideIndex + 1) + ' 张，共 ' + slides.length + ' 张' + (title ? '：' + title : '');
      }

      if (userInitiated) restartCarousel();
    }

    function stopCarousel() {
      if (carouselTimer) {
        window.clearInterval(carouselTimer);
        carouselTimer = null;
      }
    }

    function startCarousel() {
      if (reduceMotion || carouselPaused || userPaused) return;
      stopCarousel();
      carouselTimer = window.setInterval(function () {
        goTo(slideIndex + 1, false);
      }, INTERVAL);
    }

    function restartCarousel() {
      stopCarousel();
      startCarousel();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(Number(dot.getAttribute('data-go')) || 0, true);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goTo(slideIndex - 1, true);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo(slideIndex + 1, true);
      });
    }

    function updatePauseButton() {
      if (!pauseBtn) return;
      pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
      pauseBtn.setAttribute('aria-label', userPaused ? '播放轮播' : '暂停轮播');
      if (pauseIcon) pauseIcon.setAttribute('href', userPaused ? '#i-play' : '#i-pause');
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        userPaused = !userPaused;
        updatePauseButton();
        if (userPaused) {
          stopCarousel();
        } else {
          carouselPaused = false;
          startCarousel();
        }
      });
    }
    updatePauseButton();

    hero.addEventListener('mouseenter', function () {
      carouselPaused = true;
      stopCarousel();
    });

    hero.addEventListener('mouseleave', function () {
      carouselPaused = false;
      if (!hero.contains(document.activeElement)) startCarousel();
    });

    hero.addEventListener('focusin', function () {
      carouselPaused = true;
      stopCarousel();
    });

    hero.addEventListener('focusout', function (event) {
      if (!hero.contains(event.relatedTarget)) {
        carouselPaused = false;
        startCarousel();
      }
    });

    hero.addEventListener('keydown', function (event) {
      var target = event.target;
      var interactive = target && target.closest ? target.closest('a, button') : null;
      if (interactive && !interactive.closest('.hero__footer')) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(slideIndex - 1, true);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(slideIndex + 1, true);
      }
    });

    var swipeStartX = 0;
    var swipeStartY = 0;
    var swipeTracking = false;
    var swipePointerId = null;

    function endSwipe(event) {
      if (!swipeTracking) return;
      if (event && event.pointerId != null && event.pointerId !== swipePointerId) return;
      swipeTracking = false;
      if (
        event &&
        event.pointerId != null &&
        hero.hasPointerCapture &&
        hero.hasPointerCapture(event.pointerId)
      ) {
        try {
          hero.releasePointerCapture(event.pointerId);
        } catch (error) {
          /* 忽略释放捕获失败 */
        }
      }
      swipePointerId = null;
    }

    hero.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse') return;
      var target = event.target;
      if (target && target.closest && target.closest('a, button, input, textarea, select')) {
        return;
      }
      swipeTracking = true;
      swipePointerId = event.pointerId;
      swipeStartX = event.clientX;
      swipeStartY = event.clientY;
      if (hero.setPointerCapture) {
        try {
          hero.setPointerCapture(event.pointerId);
        } catch (error) {
          /* 某些浏览器不支持指针捕获时退化为普通滑动 */
        }
      }
    });

    hero.addEventListener('pointerup', function (event) {
      if (!swipeTracking || event.pointerId !== swipePointerId) return;
      var dx = event.clientX - swipeStartX;
      var dy = event.clientY - swipeStartY;
      endSwipe(event);
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        goTo(slideIndex + (dx < 0 ? 1 : -1), true);
      }
    });

    hero.addEventListener('pointercancel', endSwipe);
    hero.addEventListener('lostpointercapture', endSwipe);
    window.addEventListener('pointerup', endSwipe);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopCarousel();
      else startCarousel();
    });

    startCarousel();
  }

  /* ------------------------------------------------------------------------
     08. 数字滚动
     ------------------------------------------------------------------------ */
  var counters = $$('.stat__num');
  if (counters.length) {
    var counted = false;

    var formatNumber = function (value) {
      return Number(value).toLocaleString('en-US');
    };

    var animateCounter = function (el) {
      var target = Number(el.getAttribute('data-target')) || 0;
      if (reduceMotion || !window.requestAnimationFrame) {
        el.textContent = formatNumber(target);
        return;
      }
      var duration = 1500;
      var startTime = 0;

      function frame(now) {
        if (!startTime) startTime = now;
        var progress = Math.min((now - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = formatNumber(Math.round(target * eased));
        if (progress < 1) window.requestAnimationFrame(frame);
        else el.textContent = formatNumber(target);
      }

      window.requestAnimationFrame(frame);
    };

    var runCounters = function () {
      if (counted) return;
      counted = true;
      counters.forEach(animateCounter);
    };

    window.addEventListener('beforeprint', function () {
      counters.forEach(function (el) {
        el.textContent = formatNumber(el.getAttribute('data-target'));
      });
    });

    if (!reduceMotion) {
      counters.forEach(function (el) {
        el.textContent = '0';
      });
    }

    if ('IntersectionObserver' in window && !reduceMotion) {
      var statsGrid = $('.stats__grid');
      if (statsGrid) {
        var counterObserver = new IntersectionObserver(
          function (entries, observer) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                runCounters();
                observer.disconnect();
              }
            });
          },
          { threshold: 0.35 }
        );
        counterObserver.observe(statsGrid);
      } else {
        runCounters();
      }
    } else {
      counters.forEach(function (el) {
        el.textContent = formatNumber(el.getAttribute('data-target'));
      });
    }
  }

  /* ------------------------------------------------------------------------
     09. 滚动显现
     ------------------------------------------------------------------------ */
  var revealElements = $$('.reveal');
  if (revealElements.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
      );
      revealElements.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      revealElements.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }
  }

  /* ------------------------------------------------------------------------
     10. 导航滚动高亮
     ------------------------------------------------------------------------ */
  var spyLinks = $$('.nav-link[href^="#"]');
  var spySections = ['services', 'solutions', 'tech', 'esg', 'news', 'about'];
  var linkMap = {};

  spyLinks.forEach(function (link) {
    var id = link.getAttribute('href').slice(1);
    if (spySections.indexOf(id) !== -1 && !linkMap[id]) linkMap[id] = link;
  });

  if ('IntersectionObserver' in window) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          if (id === 'home') {
            spyLinks.forEach(function (link) {
              link.classList.remove('is-active');
              link.removeAttribute('aria-current');
            });
            return;
          }
          var activeLink = linkMap[id];
          if (!activeLink) return;
          spyLinks.forEach(function (link) {
            link.classList.remove('is-active');
            link.removeAttribute('aria-current');
          });
          activeLink.classList.add('is-active');
          activeLink.setAttribute('aria-current', 'location');
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    spySections.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spyObserver.observe(section);
    });
    var homeSection = document.getElementById('home');
    if (homeSection) spyObserver.observe(homeSection);
  }

  /* ------------------------------------------------------------------------
     11. 页脚年份
     ------------------------------------------------------------------------ */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
