var background = (function () {
  let tmp = {};
  let context = document.documentElement.getAttribute("context");
  if (context === "webapp") {
    return {
      "send": function () {},
      "receive": function (callback) {}
    }
  } else {
    chrome.runtime.onMessage.addListener(function (request) {
      for (let id in tmp) {
        if (tmp[id] && (typeof tmp[id] === "function")) {
          if (request.path === "background-to-interface") {
            if (request.method === id) {
              tmp[id](request.data);
            }
          }
        }
      }
    });
    /*  */
    return {
      "receive": function (id, callback) {
        tmp[id] = callback;
      },
      "send": function (id, data) {
        chrome.runtime.sendMessage({
          "method": id, 
          "data": data,
          "path": "interface-to-background"
        }, function () {
          return chrome.runtime.lastError;
        });
      }
    }
  }
})();

var config = {
  "connection": null,
  "interface": {
    set theme (val) {config.storage.write("theme", val)},
    get theme () {return config.storage.read("theme") !== undefined ? config.storage.read("theme") : "light"},
    set skin (val) {config.storage.write("skin", val)},
    get skin () {return config.storage.read("skin") !== undefined ? config.storage.read("skin") : ''}
  },
  "gauge": {
    "first": true,
    "object": null,
    "element": null,
    "min": {"value": 0},
    "max": {"value": 100},
    "animation": {"speed": 32},
    //
    set tickscolor (val) {config.storage.write("tickscolor", val)},
    set strokecolor (val) {config.storage.write("strokecolor", val)},
    set currentcolor (val) {config.storage.write("currentcolor", val)},
    set numberscolor (val) {config.storage.write("numberscolor", val)},
    set pointercolor (val) {config.storage.write("pointercolor", val)},
    set spectrumcolor (val) {config.storage.write("spectrumcolor", val)},
    get tickscolor () {return config.storage.read("tickscolor") !== undefined ? config.storage.read("tickscolor") : config.interface.theme === "dark" ? "#333333" : "#ffffff"},
    get strokecolor () {return config.storage.read("strokecolor") !== undefined ? config.storage.read("strokecolor") : "#e0e0e0"},
    get spectrumcolor () {return config.storage.read("spectrumcolor") !== undefined ? config.storage.read("spectrumcolor") : true},
    get currentcolor () {return config.storage.read("currentcolor") !== undefined ? config.storage.read("currentcolor") : "#9f37ff"},
    get numberscolor () {return config.storage.read("numberscolor") !== undefined ? config.storage.read("numberscolor") : config.interface.theme === "dark" ? "#ebebeb" : config.interface.skin === "modern" ? "#000000" : "#555555"},
    get pointercolor () {return config.storage.read("pointercolor") !== undefined ? config.storage.read("pointercolor") : config.interface.theme === "dark" ? "#ebebeb" : "#555555"}
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      const context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?tab") config.port.name = "tab";
            if (document.location.search === "?win") config.port.name = "win";
            if (document.location.search === "?popup") config.port.name = "popup";
            /*  */
            chrome.runtime.connect({
              "name": config.port.name
            });
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          let tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp, function () {});
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id, function () {});
        }
      }
    }
  },
  "poll": {
    "last": null,
    "timer": null,
    "interval": 1000,
    "tick": function () {
      if (!config.connection) return;
      if (config.app.signature() !== config.poll.last) {
        config.app.start();
      }
    },
    "start": function () {
      if (config.poll.timer) return;
      config.poll.timer = window.setInterval(config.poll.tick, config.poll.interval);
    }
  },
  "ui": {
    "timer": null,
    "copytimer": null
  },
  "view": {
    "current": "main",
    "height": null,
    "switch": function (view) {
      const main = document.querySelector("#viewmain");
      const log = document.querySelector("#viewlog");
      if (view === "log") {
        config.view.height = document.body.offsetHeight;
      }
      config.view.current = view;
      document.documentElement.setAttribute("data-view", view);
      document.body.style.minHeight = view === "log" ? config.view.height + "px" : "";
      /*  */
      if (view === "log") {
        main.removeAttribute("data-active");
        log.setAttribute("data-active", "true");
        config.app.renderlog();
      } else {
        log.removeAttribute("data-active");
        main.setAttribute("data-active", "true");
      }
    }
  },
  "downlink": {
    "current": 0,
    "options": {
      "fontSize": 40,
      "angle": -0.175,
      "lineWidth": 0.2,
      "pointer": {
        "length": 0.4,
        "color": "#555555",
        "strokeWidth": 0.035
      },
      "highDpiSupport": true,
      "strokeColor": "#e0e0e0",
      "generateGradient": false,
      "renderTicks": {
        "divisions": 8,
        "divWidth": 0.50,
        "divLength": 0.50,
        "divColor": "#FFFFFF"
      },
      "percentColors": [
        [12.5 * 0 / 100, "#999999"],
        [12.5 * 1 / 100, "#f902f2"],
        [12.5 * 2 / 100, "#9002f9"],
        [12.5 * 3 / 100, "#6302f9"],
        [12.5 * 4 / 100, "#0281f9"],
        [12.5 * 5 / 100, "#3ec702"],
        [12.5 * 6 / 100, "#f9cc02"],
        [12.5 * 7 / 100, "#f99f02"],
        [12.5 * 8 / 100, "#f90211"]
      ],
      "staticLabels": {
        "color": "#55555500",
        "font": "10px Times",
        "labels": [
          12.5 * 0,
          12.5 * 1,
          12.5 * 2,
          12.5 * 3,
          12.5 * 4,
          12.5 * 5,
          12.5 * 6,
          12.5 * 7,
          12.5 * 8
        ]
      }
    }
  },
  "load": function () {
    const skin = document.querySelector("#skin");
    const reset = document.querySelector("#reset");
    const theme = document.querySelector("#theme");
    const reload = document.querySelector("#reload");
    const support = document.querySelector("#support");
    const viewlog = document.querySelector("#viewlog");
    const donation = document.querySelector("#donation");
    const viewmain = document.querySelector("#viewmain");
    const moreinfo = document.querySelector(".moreinfo");
    const copyreport = document.querySelector("#copyreport");
    const tickscolor = document.querySelector("#tickscolor");
    const strokecolor = document.querySelector("#strokecolor");
    const currentcolor = document.querySelector("#currentcolor");
    const numberscolor = document.querySelector("#numberscolor");
    const pointercolor = document.querySelector("#pointercolor");
    const spectrumcolor = document.querySelector("#spectrumcolor");
    const clearlog = document.querySelector(".logsection .clearlog");
    /*  */
    config.gauge.element = document.querySelector(".gauge");
    config.gauge.object = new Gauge(config.gauge.element);
    /*  */
    config.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (config.connection) {
      config.connection.addEventListener("change", config.app.start);
    }
    /*  */
    window.addEventListener("online", config.app.start);
    window.addEventListener("offline", config.app.start);
    /*  */
    spectrumcolor.addEventListener("change", function (e) {
      config.gauge.spectrumcolor = e.target.checked;
      config.app.start();
    });
    /*  */
    currentcolor.addEventListener("input", function (e) {
      config.gauge.currentcolor = e.target.value;
      config.app.refresh();
    });
    /*  */
    tickscolor.addEventListener("input", function (e) {
      config.gauge.tickscolor = e.target.value;
      config.app.refresh();
    });
    /*  */
    numberscolor.addEventListener("input", function (e) {
      config.gauge.numberscolor = e.target.value;
      config.app.refresh();
    });
    /*  */
    strokecolor.addEventListener("input", function (e) {
      config.gauge.strokecolor = e.target.value;
      config.app.refresh();
    });
    /*  */
    pointercolor.addEventListener("input", function (e) {
      config.gauge.pointercolor = e.target.value;
      config.app.refresh();
    });
    /*  */
    skin.addEventListener("click", function () {
      config.interface.skin = config.interface.skin === "modern" ? '' : "modern";
      document.documentElement.setAttribute("skin", config.interface.skin);
      config.app.start();
    });
    /*  */
    theme.addEventListener("click", function () {
      const attribute = document.documentElement.getAttribute("theme");
      config.interface.theme = attribute === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("theme", config.interface.theme);
      config.app.start();
    });
    /*  */
    reset.addEventListener("click", function () {
      const action = window.confirm("Are you sure you want to reset the extension to factory settings?");
      if (action) {
        config.storage.write("log", null);
        config.storage.write("skin", null);
        config.storage.write("theme", null);
        config.storage.write("tickscolor", null);
        config.storage.write("strokecolor", null);
        config.storage.write("currentcolor", null);
        config.storage.write("numberscolor", null);
        config.storage.write("pointercolor", null);
        config.storage.write("spectrumcolor", null);
        /*  */
        config.app.start();
      }
    });
    /*  */
    clearlog.addEventListener("click", function () {
      const action = window.confirm("Are you sure you want to clear the connection log?");
      if (action) {
        config.storage.write("log", null);
        config.app.renderlog();
      }
    });
    /*  */
    copyreport.addEventListener("click", config.app.copy);
    reload.addEventListener("click", function () {document.location.reload()});
    support.addEventListener("click", function () {background.send("support")});
    donation.addEventListener("click", function () {background.send("donation")});
    moreinfo.addEventListener("click", function () {background.send("moreinfo")});
    viewlog.addEventListener("click", function () {config.view.switch("log")});
    viewmain.addEventListener("click", function () {config.view.switch("main")});
    /*  */
    config.poll.start();
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  },
  "app": {
    "signature": function () {
      const c = config.connection;
      return [navigator.onLine, c.type, c.effectiveType, c.downlink, c.downlinkMax, c.rtt, c.saveData].join("|");
    },
    "value": function (value, unit) {
      if (value === undefined || value === null || value === '') return "N/A";
      return value + (unit ? unit : '');
    },
    "hint": function (value) {
      const hints = {"3g": " (ok)", "4g": " (fast)", "2g": " (slow)", "slow-2g": " (very slow)", "true": " (data saver on)"};
      return typeof hints[value] === "string" ? hints[value] : '';
    },
    "refresh": function () {
      window.clearTimeout(config.ui.timer);
      config.ui.timer = window.setTimeout(config.app.start, 150);
    },
    "copy": function () {
      const c = config.connection;
      const lines = [
        "Network Information report - " + new Date().toLocaleString(),
        "Browser online: " + (window.navigator.onLine ? "yes" : "no"),
        "Connection type: " + config.app.value(c.type),
        "Connection rtt: " + config.app.value(c.rtt, "ms"),
        "Connection saveData: " + config.app.value(c.saveData),
        "Connection downlinkMax: " + config.app.value(c.downlinkMax, "Mb/s"),
        "Connection effectiveType: " + config.app.value(c.effectiveType),
        "Connection downlink: " + config.app.value(c.downlink, "Mb/s")
      ];
      const text = lines.join("\n");
      /*  */
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(config.app.flash).catch(function () {config.app.copyfallback(text)});
      } else {
        config.app.copyfallback(text);
      }
    },
    "flash": function () {
      const cell = document.querySelector("#copyreport");
      cell.classList.add("copied");
      /*  */
      window.clearTimeout(config.ui.copytimer);
      config.ui.copytimer = window.setTimeout(function () {cell.classList.remove("copied")}, 600);
    },
    "copyfallback": function (text) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "readonly");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      /*  */
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      config.app.flash();
    },
    "gaugejump": function (current) {
      if (!config.gauge.first) return;
      config.gauge.object.displayedValue = current;
      /*  */
      const pointers = config.gauge.object.gp;
      for (let i = 0; i < pointers.length; i++) {
        pointers[i].displayedValue = current;
      }
      /*  */
      config.gauge.first = false;
    },
    "update": function (e) {
      const label = document.querySelector(".label");
      const info = document.querySelector(".label .info");
      const downlink = document.querySelector(".label .downlink");
      /*  */
      info.style.top = e.outerWidth < 450 ? "99%" : "45%";
      info.style.left = e.outerWidth < 450 ? "0" : "-82%";
      downlink.style.top = e.outerWidth < 450 ? "85%" : "90%";
      info.style.transform = e.outerWidth < 450 ? "none" : "rotate(-90deg)";
      label.style.marginLeft = e.outerWidth < 450 ? (((e.outerWidth - 300) / 2) - 15) + "px" : "auto";
    },
    "logrecord": function (signature) {
      const c = config.connection;
      const entry = {
        "rtt": c.rtt,
        "type": c.type,
        "sig": signature,
        "downlink": c.downlink,
        "saveData": c.saveData,
        "downlinkMax": c.downlinkMax,
        "effectiveType": c.effectiveType,
        "online": window.navigator.onLine,
        "time": new Date().toLocaleTimeString()
      };
      const log = config.storage.read("log");
      const entries = Array.isArray(log) ? log : [];
      /*  */
      entries.unshift(entry);
      config.storage.write("log", entries.slice(0, 30));
    },
    "logbaseline": function (signature) {
      const log = config.storage.read("log");
      const entries = Array.isArray(log) ? log : [];
      /*  */
      if (entries.length && entries[0].sig === signature) return;
      config.app.logrecord(signature);
    },
    "renderlog": function () {
      const rows = document.querySelector(".logsection .logrows");
      const title = document.querySelector(".logsection .logtitle");
      const log = config.storage.read("log");
      const entries = Array.isArray(log) ? log : [];
      title.textContent = "Connection log (" + entries.length + ")";
      rows.textContent = '';
      /*  */
      if (!entries.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "No changes yet";
        rows.appendChild(empty);
        return;
      }
      /*  */
      for (let i = 0; i < entries.length; i++) {
        const row = document.createElement("div");
        row.textContent = config.app.logtext(entries[i]);
        row.title = config.app.logtitle(entries[i]);
        rows.appendChild(row);
      }
    },
    "logtext": function (e) {
      return e.time + " • " + (e.online ? "online" : "offline") + " • " + (e.effectiveType || "N/A") + " • " + config.app.value(e.downlink, "Mb/s") + " • rtt " + config.app.value(e.rtt, "ms") + " • " + (e.type || "N/A");
    },
    "logtitle": function (e) {
      return e.time + " - " + (e.online ? "online" : "offline") + " - type: " + config.app.value(e.type) + " - effectiveType: " + config.app.value(e.effectiveType) + " - downlink: " + config.app.value(e.downlink, "Mb/s") + " - downlinkMax: " + config.app.value(e.downlinkMax, "Mb/s") + " - rtt: " + config.app.value(e.rtt, "ms") + " - saveData: " + config.app.value(e.saveData);
    },
    "start": function () {
      const wifion = document.querySelector(".wifi-on");
      const wifioff = document.querySelector(".wifi-off");
      const downlink = document.querySelector(".label .downlink");
      /*  */
      if (config.connection) {
        const metric = config.connection.downlink;
        const numerics = [0, 1, 5, 10, 20, 30, 50, 75, 100];
        /*  */
        if (typeof metric === "number") {
          const value = Math.min(metric, 100);
          for (let i = 0; i < 8; i++) {
            if (value >= numerics[i] && value <= numerics[i + 1]) {
              config.downlink.current = (i + (value - numerics[i]) / (numerics[i + 1] - numerics[i])) * (100 / 8);
              config.app.gaugejump(config.downlink.current);
              config.gauge.object.set(config.downlink.current);
              downlink.textContent = metric + "Mb/s";
              break;
            }
          }
        } else {
          config.downlink.current = 0;
          downlink.textContent = "N/A";
          config.app.gaugejump(config.downlink.current);
          config.gauge.object.set(config.downlink.current);
        }
      } else {
        config.connection = {};
        downlink.textContent = "N/A";
        config.gauge.object.set(config.downlink.current);
        config.app.gaugejump(config.downlink.current);
      }
      /*  */
      tickscolor.value = config.gauge.tickscolor;
      strokecolor.value = config.gauge.strokecolor;
      numberscolor.value = config.gauge.numberscolor;
      currentcolor.value = config.gauge.currentcolor;
      pointercolor.value = config.gauge.pointercolor;
      spectrumcolor.checked = config.gauge.spectrumcolor;
      config.downlink.options.strokeColor = config.gauge.strokecolor;
      config.downlink.options.pointer.color = config.gauge.pointercolor;
      config.downlink.options.renderTicks.divColor = config.gauge.tickscolor;
      document.documentElement.style.setProperty("--numbers-color", config.gauge.numberscolor);
      currentcolor.parentNode.style.display = config.gauge.spectrumcolor ? "none" : "table-cell";
      config.downlink.options.percentColors = config.methods.generate.colors(config.gauge.spectrumcolor);
      document.documentElement.setAttribute("theme", config.interface.theme !== undefined ? config.interface.theme : "light");
      document.documentElement.setAttribute("skin", config.interface.skin);
      /*  */
      config.gauge.object.animationSpeed = config.gauge.animation.speed;
      config.gauge.object.minValue = config.gauge.min.value;
      config.gauge.object.maxValue = config.gauge.max.value;
      config.gauge.object.setOptions(config.downlink.options);
      config.gauge.object.update(true);
      /*  */
      const fontcolor = config.gauge.object.getColorForPercentage(config.downlink.current / 100);
      if (fontcolor) {
        const dark = config.interface.theme === "dark";
        downlink.style.color = dark ? "rgb(64, 91, 255)" : fontcolor;
        wifion.querySelector("svg").style.fill = dark ? "rgb(112, 132, 255)" : fontcolor;
        wifioff.querySelector("svg").style.fill = dark ? "rgb(112, 132, 255)" : fontcolor;
      }
      /*  */
      wifion.style.display = window.navigator.onLine ? "flex" : "none";
      wifioff.style.display = window.navigator.onLine ? "none" : "flex";
      /*  */
      document.querySelector(".metrics .type").textContent = "1 • Connection type: " + config.app.value(config.connection.type);
      document.querySelector(".metrics .rtt").textContent = "2 • Connection rtt: " + config.app.value(config.connection.rtt, "ms");
      document.querySelector(".metrics .saveData").textContent = "3 • Connection saveData: " + config.app.value(config.connection.saveData) + config.app.hint(config.connection.saveData);
      document.querySelector(".metrics .downlinkMax").textContent = "4 • Connection downlinkMax: " + config.app.value(config.connection.downlinkMax, "Mb/s");
      document.querySelector(".metrics .effectiveType").textContent = "5 • Connection effectiveType: " + config.app.value(config.connection.effectiveType) + config.app.hint(config.connection.effectiveType);
      document.querySelector(".metrics .downlink").textContent = "6 • Connection downlink: " + config.app.value(config.connection.downlink, "Mb/s");
      /*  */
      const signature = config.app.signature();
      if (config.poll.last === null) {
        config.app.logbaseline(signature);
      } else {
        if (signature !== config.poll.last) {
          config.app.logrecord(signature);
        }
      }
      config.poll.last = signature;
      /*  */
      if (document.documentElement.getAttribute("data-view") === "log") {
        config.app.renderlog();
      }
    }
  },
  "methods": {
    "hue": {
      "to": {
        "rgb": function (p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          /*  */
          return p;
        }
      }
    },
    "hls": {
      "to": {
        "hex": function (h, s, l) {
          h = h / 360;
          s = s / 100;
          l = l / 100;
          /*  */
          let r, g, b;
          if (s === 0) {
            r = g = b = l;
          } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            /*  */
            r = config.methods.hue.to.rgb(p, q, h + 1 / 3);
            g = config.methods.hue.to.rgb(p, q, h);
            b = config.methods.hue.to.rgb(p, q, h - 1 / 3);
          }
          /*  */
          const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
          return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
      }
    },
    "adjust": {
      "color": {
        "brightness": function (color, factor) {
          const num = parseInt(color.replace('#', ''), 16);
          let r = (num >> 16) & 0xff;
          let g = (num >> 8) & 0xff;
          let b = num & 0xff;
          /*  */
          if (factor < 0) {
            r = Math.round(r * (1 + factor));
            g = Math.round(g * (1 + factor));
            b = Math.round(b * (1 + factor));
          } else {
            r = Math.round(r + (255 - r) * factor);
            g = Math.round(g + (255 - g) * factor);
            b = Math.round(b + (255 - b) * factor);
          }
          /*  */
          r = Math.max(0, Math.min(255, r));
          g = Math.max(0, Math.min(255, g));
          b = Math.max(0, Math.min(255, b));
          /*  */
          return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        }
      }
    },
    "generate": {
      "spectrum": {
        "color": function (index, totalSteps) {
          const hueEnd = 0;
          const hueStart = 270;
          const hue = hueStart + ((hueEnd - hueStart) * (index - 1)) / (totalSteps - 1);
          /*  */
          return config.methods.hls.to.hex(hue, 100, 50);
        }
      },
      "colors": function (spectrum) {
        const total = 8;
        const colors = [];
        const dark = config.interface.theme === "dark";
        const adjust = (color) => dark ? config.methods.adjust.color.brightness(color, 0.25) : color;
        /*  */
        for (let i = 0; i <= total; i++) {
          if (i === 0) {
            colors.push([12.5 * i / 100, adjust("#d1d1d1")]);
          } else {
            if (spectrum) {
              const spectrumColor = config.methods.generate.spectrum.color(i, total);
              colors.push([12.5 * i / 100, adjust(spectrumColor)]);
            } else {
              if (i === 1) {
                colors.push([12.5 * i / 100, adjust(config.gauge.currentcolor)]);
              } else {
                const darknessFactor = -1 * ((i - 1) / (total - 1));
                const colorVariation = config.methods.adjust.color.brightness(config.gauge.currentcolor, darknessFactor);
                colors.push([12.5 * i / 100, adjust(colorVariation)]);
              }
            }
          }
        }
        /*  */
        return colors;
      }
    }
  }
};

config.port.connect();

window.addEventListener("load", config.load, false);
