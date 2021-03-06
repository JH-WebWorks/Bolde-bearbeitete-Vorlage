"use strict";

var EventEmitter = require("events").EventEmitter;
var Actions = require("../Actions");
var Components = require("../Components");
var TabPanel = require("../components/TabPanel");

class TabStore extends EventEmitter {
  constructor() {
    super();

    this.tabs = {};
    this.selected = [-1, -1, -1];

    var id = 0;

    this.dispatchToken = window.Dispatcher.register((a) => {
      switch (a.actionType) {
        case "tab.new_msg":
          this.openMessage(a.title, a.text, a.links);
          break;
        case "tab.open":
          this.addTab(a.id, a.title, a.node, a.panel, a.cb);
          break;
        case "tab.close":
          this.closeTab(a.id);
          break;
        case "tab.move_to_panel":
          this.moveTab(a.tab, a.panel);
          break;
        case "tab.focus":
          this.focusTab(a.id);
          break;
        case "user.login":
          this.tabs["_UserTab"].title = "User: " + a.user;
        /*                case 'user.open_plist':
                    this.addTab('_ProjectList', 'Projects', Components.ProjectList(), 1);
                    break;*/
        /*                case 'user.logout':
                    this.tabs['_UserTab'].title = 'Anonymous User';
                    this.closeAllFilesAndProjects();
                    this.closeTab('_ProjectList');
                    this.closeTab('_settings');
                    break;
                case 'project.open':
                    window.Dispatcher.waitFor([window.ProjectStore.dispatchToken]);
                    var tabname = `projv_${a.user}/${a.name}`;
                    if (this.tabs[tabname]) {
                        this.focusTab(tabname);
                    } else {
                        this.addTab(tabname, a.name,
                            Components.ProjectView(a.user, a.name), 0,
                            () => { Actions.project.close(a.user, a.name);
                                    return false; }
                        );
                    }
                    break;*/
        case "project.delete":
        case "project.close":
          this.closeTab(`projv_${a.user}/${a.name}`);
          Object.keys(this.tabs)
            .filter((id) => id.match(`^file_${a.user}/${a.name}`))
            .forEach((id) => this.closeTab(id));
          break;
        case "file.open":
          var fullpath = a.user + "/" + a.project + "/" + a.path;
          var tname = "file_" + fullpath;
          if (this.tabs[tname]) {
            this.focusTab(tname);
          } else {
            this.addTab(
              tname,
              a.path,
              Components.VisualEditor(fullpath),
              1,
              () => {
                Actions.file.close(a.user, a.project, a.path);
                return true;
              }
            );
          }
          break;
        case "file.delete":
        case "file.close":
          this.closeTab("file_" + a.user + "/" + a.project + "/" + a.path);
          break;
        case "file.put":
          window.Dispatcher.waitFor([window.FileStore.dispatchToken]);
          var fullpath = a.user + "/" + a.project + "/" + a.path;
          var tname = "file_" + fullpath;
          if (this.tabs[tname]) {
            this.closeTab(tname);
            this.addTab(tname, a.path, Components.Editor(fullpath));
          }
          break;
        case "log.new":
          window.Dispatcher.waitFor([window.LogStore.dispatchToken]);
          var project = a.name.substr(a.name.search(/\/[^\/]+$/) + 1);
          if (this.tabs["log_" + a.name]) {
            this.focusTab("log_" + a.name);
          } else {
            this.addTab(
              "log_" + a.name,
              project + " log",
              Components.LogView(a.name),
              2
            );
          }
          break;
        case "output":
          var tn = "output_" + a.name;
          if (this.tabs[tn]) {
            this.updateTab(tn, Components.TBView(a.results, true));
          } else {
            this.addTab(
              tn,
              a.name + " results",
              Components.TBView(a.results, true),
              1
            );
          }
          break;
        case "treebank.open":
          this.addTab("treebank_" + id++, a.name, Components.TBView(a.name), 1);
          break;
      }
    });
  }

  openMessage(title, text, links) {
    this.addTab("message_" + title, title, Components.MDText(text, links));
  }

  addTab(id, title, node, panel, closeCallback) {
    if (panel === undefined) {
      panel = 1;
    }
    this.tabs[id] = {
      id: id,
      title: title,
      panel: panel,
      node: node,
      closecb: closeCallback,
    };
    this.selected[panel] = id;
    this.emit("changed");
  }

  updateTab(id, node) {
    this.tabs[id].node = node;
    this.emit("changed");
  }

  getShouldClose(id) {
    return this.tabs[id].closecb;
  }

  getTab(id) {
    return this.tabs[id];
  }

  closeTab(id) {
    if (this.tabs[id] === undefined) {
      return;
    }
    var panel = this.tabs[id].panel;
    delete this.tabs[id];
    if (this.selected[panel] == id) {
      this.unselect(panel);
    }
    this.emit("changed");
  }

  getTabs(panel) {
    return Object.keys(this.tabs)
      .filter((id) => this.tabs[id].panel == panel)
      .map((id) => {
        var ret = this.tabs[id];
        ret.selected = this.selected[panel] == id;
        return ret;
      });
  }

  moveTab(id, panel) {
    var tab = this.tabs[id];
    if (tab.panel != panel) {
      var oldpanel = tab.panel;
      tab.panel = panel;
      this.selected[panel] = id;
      this.unselect(oldpanel);
      this.emit("changed");
    } else if (this.selected[panel] != id) {
      this.selected[panel] = id;
      this.emit("changed");
    }
  }

  focusTab(id) {
    var tab = this.tabs[id];
    this.selected[tab.panel] = id;
    this.emit("changed");
  }

  unselect(panel) {
    if (
      !Object.keys(this.tabs).some(function (id) {
        if (this.tabs[id].panel == panel) {
          this.selected[panel] = id;
          return true;
        }
      }, this)
    ) {
      this.selected[panel] = -1;
    }
  }

  closeAllFilesAndProjects() {
    Object.keys(this.tabs)
      .filter((id) => id.match("^file_|^projv"))
      .forEach((id) => this.closeTab(id));
    this.emit("changed");
  }
}

module.exports = TabStore;
