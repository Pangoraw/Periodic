{$, View} = require "space-pen"
path = require "path"
sqlite3 = require("sqlite3").verbose()

module.exports =
class PeriodicView extends View
  @content: ->
    @div class: "periodic", =>
      @div class: "structure periodic-tab", =>
        @ul class: "tables-list"
        @div class: "table-structure", =>
          @table class: "table-structure-table"
      @div class: "browser periodic-tab", =>
        @div class: "periodic-browser-options", =>
          @select class: "periodic-dropdown", =>
        @div class: "table-browser", =>
          @table class: "table-browser-table"
  tables: []
  selectedStructureElts: []
  selectedDataElts: []
  initialize: ({@editorId, @filePath}) ->
    @filePath = @editorForId(@editorId).getPath() if not @filePath? and @editorForId?
    @fileName = path.basename(@filePath)
    if path.extname(@filePath) in [ ".sqlite", ".db" ] then @openFile()
    else @error()


  getTitle : -> "Periodic Table - #{path.basename(@filePath)}"

  tableNameForId: (id) =>
    for table in @tables
       return table.name if id?.toString() is table.rootpage?.toString()
    null

  editorForId: (editorId) ->
    for editor in atom.workspace.getTextEditors()
      return editor if editor.id?.toString() is editorId.toString()
    null

  openFile: ->
    @db = new sqlite3.Database @filePath, sqlite3.OPEN_READONLY
    @db.all "SELECT * FROM sqlite_master WHERE type='table'", {}, (err, rows) =>
      return if err? or not rows?
      @tables = rows
      for row in rows
        @find("ul.tables-list").append($("<li></li>").text(row.name).click((e) => @onClick(e); @loadTableStructure(row, e)))
        @find("select.periodic-dropdown").append($("<option></option>").val(row.rootpage).text(row.name))
      @find("select.periodic-dropdown").change (e) =>
        tableName = @tableNameForId(@find("select.periodic-dropdown").val())
        @db.all "SELECT * FROM #{tableName}", (err, contents) =>
          return if err? or not contents?
          titles = []
          if contents?.length > 0
            titles.push p for p of contents[0]
          @createTable contents, "browser", titles

  onClick: (e) =>
    e.preventDefault()
    e.target.classList.add("selected")
    if e.target.classList.contains("browser")
      for elt in @selectedDataElts
        elt.classList.remove("selected")
      @selectedDataElts = [ e.target ]
    else
      for elt in @selectedStructureElts
        elt.classList.remove("selected")
      @selectedStructureElts = [ e.target ]

  loadTableStructure: (row, e) =>
    @db.all "PRAGMA table_info(#{e.target.innerText})", {}, (err, rows) =>
      return if err?
      @createTable rows


  createTable: (rows = [], loc="structure", titles) ->
    table = @find("table.table-#{loc}-table")
    table.empty()
    tr = $("<tr></tr>")
    titles = titles ? ["cid", "Name", "Type", "Not null", "Default value", "Pk"]
    tr.append($("<th></th>").text(title)) for title in titles
    table.append tr
    for row in rows
      rowElt = $("<tr></tr>")
      rowElt.append($("<td></td>").text(row[property] ? "Null").click(@onClick).addClass(loc)) for property of row
      table.append(rowElt)

  error: ->
    title = @find('h1')
    title.text "Error : this file (#{@filePath}) is not a database file."
    title.css("color", "red")
