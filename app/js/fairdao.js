class FairDaoModule {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || "/";
    this.kvs = {};
    this.translator=null;
  }

  // 修复 getLang 方法，添加 getQuery 功能和正确的浏览器语言检测
  getLang() {
    // 获取 URL 查询参数中的 lang
    const getQuery = (param) => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    };

    let lang = getQuery("lang");
    let lsLang = localStorage.getItem("lang");

    // 如果 URL 参数有 lang，优先使用
    if (lang) {
      lang = lang.toLowerCase();
      if (lang !== lsLang) {
        localStorage.setItem("lang", lang);
      }
      return lang;
    }

    // 如果 localStorage 中有语言设置，使用
    if (lsLang) {
      return lsLang;
    }

    // 使用浏览器语言
    lang = navigator.language || navigator.userLanguage;
    let langs = lang.split("-");
    lang = langs[0].toLowerCase();

    // 保存到 localStorage
    localStorage.setItem("lang", lang);
    return lang;
  }

  async init() {
    this.lang = this.getLang() || "zh";
    this.loadLangs();
    let foundLang = false;
    for (let i = 0; i < this.langdata.Langs.length; i++) {
      let nav = this.langdata.Langs[i];
      if (nav.Name) {
        if (nav.Name === this.lang) {
          foundLang = true;
          break;
        }
      }
    }
    if (!foundLang) {
      this.lang = this.langdata.Lang;
    }
    document.body.setAttribute("lang", this.lang.toLowerCase());

    let data = null;
    try {
      data = await fetch(`${this.baseUrl}i18n/${this.lang}.json`);
    } catch {
      data = await fetch(`${this.baseUrl}i18n/zh.json`);
    }
    this.kvs = await data.json();
    this.translator = new Translator(this.kvs);
    
    this.processDataHtml(document.body, this.translator);
    try {
      this.i18nElement(document.body, this.translator);
    } catch (ex) {
      console.log(ex);
    }    
  }

  async processDataHtml(element,translator) {    
    element.querySelectorAll("[data-html]").forEach((e) => {
      let key = e.getAttribute("data-html");
      fetch(`${this.baseUrl}${key}`)
        .then((res) => res.text())
        .then((html) => {
          e.innerHTML = html;
          this.i18nElement(e, translator);
        });
    });
  }

  async loadModule(module) {
    const path = `${this.baseUrl}${module}/`;
    let js = `${path}index.js`;
    let res = await fetch(`${path}index.html`);
    let data = await res.text();
    let pageEl = document.getElementById(module);
    if (!pageEl) {
      pageEl = document.getElementById("main-content");
    }
    if (pageEl) {
      pageEl.innerHTML = data;
      let Module = await import(js);
      if (Module) {
        let moduleObj = new Module.default();
        moduleObj.name = module;
        moduleObj.container = pageEl;
        moduleObj.fairdao = this;
        moduleObj.path = path;
        moduleObj.i18n = function () {
          return this.fairdao.i18n(moduleObj);
        };
        moduleObj.template = function () {
          return this.fairdao.template(moduleObj);
        };        
        await moduleObj.init();
        return moduleObj;
      }
    }
    return null;
  }

  async i18n(moduleObj) {
    let lang = moduleObj.fairdao.lang;
    let response = null;
    try {
      response = await fetch(
        `${this.baseUrl}${moduleObj.name}/i18n/${lang}.json`
      );
    } catch {
      response = await fetch(`${this.baseUrl}${moduleObj.name}/i18n/zh.json`);
    }
    let data = await response.json();
    moduleObj.i18nData = data;
    moduleObj.translator = new Translator(data,moduleObj.fairdao.translator);
    this.i18nElement(moduleObj.container, moduleObj.translator);
    return moduleObj;
  }
  i18nElement(element, translator) {
    const dataI18n = "data-i18n";
    const dataI18nAttrs=["data-i18n-title","data-i18n-placeholder","data-i18n-aria-label"];    
    this.processTemplate(element, translator.data);
    // 处理 data-i18n 属性
    element.querySelectorAll(`[${dataI18n}]`).forEach((e) => {
      let key = e.getAttribute(dataI18n);
      try {        
        let value = translator.translate(key);
        // 检测 value 是否包含 HTML 标签，如果包含则使用 innerHTML 渲染
        if (/<[^>]+>/.test(value)) {
          e.innerHTML = value;
        } else {
          e.textContent = value || key;
        }
      } catch (ex) {
        console.log(ex);        
        e.textContent = key;
      }
      e.removeAttribute(dataI18n);
    });
    // 处理 data-i18n 所有属性
    dataI18nAttrs.forEach((attr) => {
      element.querySelectorAll(`[${attr}]`).forEach((e) => {
        let key = e.getAttribute(attr);
      try {
        let value = translator.translate(key);
        e.setAttribute(attr.substring(10), value || key);
      } catch (ex) {
        console.log(ex);
        e.setAttribute(attr.substring(10), key);
      }
      e.removeAttribute(attr);
      });
    });
  }

  async template(moduleObj) {
    if (moduleObj.i18nData) {
      this.processTemplate(moduleObj.container, data);
    }
  }

  processTemplate(element, json) {
    const DATA_ARRAY = "data-array";
    let data = json || {};
    let com = this.kvs || {};
    element.querySelectorAll("[" + DATA_ARRAY + "]").forEach((e) => {
      let html = e.innerHTML;
      e.innerHTML = "";
      let key = e.getAttribute(DATA_ARRAY);
      let items = eval(key);
      let newHtml = "";
      let hasTemplate = html.indexOf("{-") >= 0;
      for (var i = 0; i < items.length; i++) {
        let item = items[i];
        item.index = i;
        let div = document.createElement("div");
        if (hasTemplate) {
          let itemHtml = this.processHtml(html, data, item);
          div.innerHTML = itemHtml;
        } else div.innerHTML = html;
        e.appendChild(div);
        this.processIFAndBIND(div, json, item);
      }
      e.removeAttribute(DATA_ARRAY);
      this.processIFAndBIND(e, json);
    });
    if (element.innerHTML.indexOf("{-") >= 0) {
      element.innerHTML = this.processHtml(element.innerHTML, json);
    }
    this.processIFAndBIND(element, json);
    this.bulma(element);
  }

  /**
   * 处理元素的data-if属性，此处不能使用混淆：data,com 名称不能混淆
   * @param {Element} element - 要处理的DOM元素
   * @param {Object} json - 包含条件判断的JSON数据
   */
  processIFAndBIND(element, data, item) {
    let DATA_IF = "data-if";
    let com = this.kvs;
    element.querySelectorAll("[" + DATA_IF + "]").forEach((e) => {
      let key = e.getAttribute(DATA_IF);
      let val = eval(key);
      if (!val) {
        e.parentNode.removeChild(e);
      } else e.removeAttribute(DATA_IF);
    });
    let bindElements = element.querySelectorAll("[data-bind]");
    bindElements.forEach((el) => {
      let exp = el.getAttribute("data-bind");
      el.textContent = eval(exp) || exp;
    });
  }

  /**
   * 处理html里的{-exp-}，此处不能使用混淆：data,com 名称不能混淆
   * @param {Element} element - 要处理的DOM元素
   * @param {Object} json - 包含绑定值的JSON数据
   */
  processHtml(html, json, item) {
    if (!html || html.indexOf("{-") < 0) {
      return "";
    }
    let data = json;
    let com = this.kvs;

    var reg = new RegExp("{-[^}]+?-}", "g");
    let itemHtml = html.replace(reg, function (s) {
      s = s.replace(/\-}/g, "").replace(/\{\-/g, "");
      let val = eval(s);
      if (typeof val === "undefined") return "";
      return val;
    });
    return itemHtml;
  }

  async loadLangs() {
    let strConfig = localStorage.getItem("config");
    let needUpdate = true;
    this.langdata = null;
    if (strConfig) {
      try {
        this.langdata = JSON.parse(strConfig);
        let lastUpdate = this.langdata.lastUpdate;
        if (Date.now() - lastUpdate < 600000) {
          //小于10分钟不用更新
          needUpdate = false;
        }
      } catch (e) {}
    }
    if (needUpdate) {
      let langResponse = await fetch(`${this.baseUrl}i18n/langs.json`);
      this.langdata = await langResponse.json();
      this.langdata.lastUpdate = Date.now();
      localStorage.setItem("config", JSON.stringify(this.langdata));
    }
    var elang = document.getElementById("langList");
    if (!elang) return;
    for (let i = 0; i < this.langdata.Langs.length; i++) {
      let nav = this.langdata.Langs[i];
      if (nav.Name) {
        var el = document.createElement("a");
        el.setAttribute("class", "navbar-item");
        el.innerHTML = nav.RealName;
        el.setAttribute("code", nav.Name);
        elang.appendChild(el);
        el.onclick = function () {
          let code = this.getAttribute("code");
          localStorage.setItem("lang", code);
          let href = location.href;
          if (href.includes("#")) {
            href = href.split("#")[0];
          }
          let oldLangKey = this.baseUrl + "pages/" + this.lang + "/";
          if (href.includes(oldLangKey)) {
            href = href.replace(
              oldLangKey,
              this.baseUrl + "pages/" + code + "/"
            );
          } else {
            href = href.replace(/([?&])lang=[^&]*/, "$1lang=" + code);
            if (!href.includes("lang=")) {
              href += (href.includes("?") ? "&" : "?") + "lang=" + code;
            }
          }
          location.href = href;
        };
      }
    }
  }

  bulma(element) {
    // 初始化 Bulma 常用交互事件
    // 1. Navbar-burger 响应式菜单切换
    element.querySelectorAll('.navbar-burger').forEach(burger => {
      burger.addEventListener('click', () => {
        const targetId = burger.dataset.target;
        const target = document.getElementById(targetId);
        if (target) {
          burger.classList.toggle('is-active');
          target.classList.toggle('is-active');
        }
      });
    });

    // 2. Modal 打开/关闭
    element.querySelectorAll('[data-bulma-modal]').forEach(trigger => {
      const modalId = trigger.dataset.bulmaModal;
      const modal = document.getElementById(modalId);
      if (!modal) return;
      // 打开
      trigger.addEventListener('click', () => modal.classList.add('is-active'));
      // 关闭（modal-background、modal-close、modal-card-head .delete）
      modal.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete')
        .forEach(close => close.addEventListener('click', () => modal.classList.remove('is-active')));
    });

    // 3. Dropdown 点击切换
    element.querySelectorAll('.dropdown-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const dropdown = trigger.closest('.dropdown');
        if (dropdown) dropdown.classList.toggle('is-active');
      });
    });
    // 点击外部关闭 dropdown
    document.addEventListener('click', e => {
      if (!e.target.closest('.dropdown')) {
        element.querySelectorAll('.dropdown').forEach(d => d.classList.remove('is-active'));
      }
    });

    // 4. Tabs 切换
    element.querySelectorAll('.tabs li').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabContainer = tab.closest('.tabs');
        if (!tabContainer) return;
        const targetPanel = tab.dataset.target;
        // 移除所有激活态
        tabContainer.querySelectorAll('li').forEach(t => t.classList.remove('is-active'));
        // 激活当前
        tab.classList.add('is-active');
        // 同步切换内容
        const contentContainer = tabContainer.nextElementSibling;
        if (contentContainer && contentContainer.classList.contains('tab-content')) {
          contentContainer.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('is-active'));
          const activePane = contentContainer.querySelector(`#${targetPanel}`);
          if (activePane) activePane.classList.add('is-active');
        }
      });
    });

    // 5. Message 关闭
    element.querySelectorAll('.message .delete').forEach(del => {
      del.addEventListener('click', () => {
        const message = del.closest('.message');
        if (message) message.remove();
      });
    });

    // 6. Notification 关闭
    element.querySelectorAll('.notification .delete').forEach(del => {
      del.addEventListener('click', () => {
        const notification = del.closest('.notification');
        if (notification) notification.remove();
      });
    });

    // 7. Collapsible（自定义 data-bulma-collapse）
    element.querySelectorAll('[data-bulma-collapse]').forEach(trigger => {
      const targetId = trigger.dataset.bulmaCollapse;
      const target = document.getElementById(targetId);
      if (!target) return;
      trigger.addEventListener('click', () => {
        target.style.display = target.style.display === 'none' ? 'block' : 'none';
      });
    });

  }
}
class Translator {
  constructor(data,parentTranslator) {
    this.data = data;
    this.parentTranslator = parentTranslator;
  }
  translate(key) {
        let value = this.data;
        const keys = key.split(".");
        for (let k of keys) {
          if (value && typeof value === "object" && k in value) {
            value = value[k];
          } else {          
            if(this.parentTranslator)  {
              value = this.parentTranslator.translate(key);
            }else{
              value = key;
            }
            break;
          }
        }
        return value;
  }
}
export default FairDaoModule;
