PeriodicView = require "./periodic-view"
{CompositeDisposable} = require "atom"
fs = require "fs"

module.exports =
  activate : ->
    @subscriptions = new CompositeDisposable
    @subscriptions.add atom.commands.add 'atom-workspace',
      'periodic:toggle': =>
        @toggle()

    atom.workspace.addOpener (uri) =>
      [protocol, path] = uri.split('://')
      return unless protocol is 'periodic'

      if path.startsWith "editor/"
        @createView editorId: path.substring 7
      else
        @createView filePath: path

  createView: (state) =>
    if state.editorId or fs.existsSync state.filePath
      new PeriodicView state

  toggle : ->
    editor = atom.workspace.getActiveTextEditor()
    return unless editor?

    @addView(editor)

  addView : (editor) ->
    return unless editor?
    atom.workspace.open("periodic://editor/#{editor.id}", {})
