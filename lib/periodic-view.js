'use babel';

import {$, View} from "space-pen";
import path from "path";
import sqlite3 from "sqlite3";

export default class PeriodicView extends View {
  static content() {
    this.div({class: "periodic"}, () => {
      this.div({class: "structure periodic-tab"}, () => {
        this.ul({class: "tables-list"});
        this.div({class: "table-structure"}, () => {
          this.table({class: "table-structure-table"});
        });
      });
      this.div({class: "browser periodic-tab"}, () => {
        this.div({class: "periodic-browser-options"}, () => {
          this.select({class: "periodic-dropdown"});
          this.button({class: "btn btn-primary"}, "Refresh");
        });
        this.div({class: "table-browser"}, () => {
          this.table({class: "table-browser-table"});
        });
      });
    });
  }

  initialize(filePath) {
    this.filePath = filePath;
    this.fileName = path.basename(this.filePath);
    this.selectedDataElts = [];
    this.selectedStructureElts = [];
    this.openFile();
    this.find("button").click(() => { this.refreshData(); });
  }

  destroy() {
    this.empty();
  }

  getTitle() { return `Periodic Table - ${this.fileName}`;}

  tableNameForId(id) {
    for (let table of this.tables)
      if (id.toString() === table.rootpage.toString())
        return table.name;
    return null;
  }

  refreshData() {
    tableName = this.tableNameForId(this.find("select.periodic-dropdown").val());
    this.db.all(`SELECT * FROM ${tableName}`, (err, contents) => {
      if (err || !contents)
        return;
      let titles = [];
      if (contents.length > 0) {
        for (let p in contents[0])
        titles.push(p);
        this.createTable(contents, "browser", titles);
      }
    });
  }


  openFile() {
    this.db = new sqlite3.Database(this.filePath, sqlite3.OPEN_READONLY);
    this.db.all("SELECT * FROM sqlite_master WHERE type='table'", {}, (err, rows) => {
      this.tables = rows;
      for (let row of rows) {
        this.find("ul.tables-list").append($("<li></li>").text(row.name).click((e) => { this.onClick(e); this.loadStructureTable(e); }));
        this.find("select.periodic-dropdown").append($("<option></option>").val(row.rootpage).text(row.name));
        this.find("select.periodic-dropdown").change((e) => { this.refreshData(); });
      }
    });
  }

  onClick(e) {
    console.log(this.selectedStructureElts);
    e.preventDefault();
    e.target.classList.add("selected");
    if (e.target.classList.contains("browser")) {
      for (let elt of this.selectedDataElts)
        elt.classList.remove("selected");
      this.selectedDataElts = [ e.target ];
    }
    else {
      for (let elt of this.selectedStructureElts)
        elt.classList.remove("selected");
      this.selectedStructureElts = [ e.target ];
    }
  }

  loadStructureTable(e) {
    this.db.all(`PRAGMA table_info(${e.target.innerText})`, {}, (err, rows) => {
      if (err)
        return;
      this.createTable(rows);
    });
  }

  createTable(rows = [], loc="structure", titles) {
    table = this.find(`table.table-${loc}-table`);
    table.empty();
    tr = $("<tr></tr>");
    titles = typeof titles !== 'undefined' ? titles : ["cid", "Name", "Type", "Not null", "Default value", "Pk"];
    for (let title of titles)
    tr.append($("<th></th>").text(title));
    table.append(tr);
    for (let row of rows) {
      rowElt = $("<tr></tr>");
      for (let property in row)
        rowElt.append($("<td></td>").text(typeof row[property] !== 'undefined' ? row[property] : "Null").click((e) => { this.onClick(e); }).addClass(loc));
      table.append(rowElt);
    }
  }
}
