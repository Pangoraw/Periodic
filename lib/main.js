'use babel';
/* @flow */

import PeriodicView from "./periodic-view";
import utils from "./utils";
import {CompositeDisposable} from "atom";

const Periodic = {
  activate() {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.workspace.addOpener(function(uri) {
      if (utils.isPathValid(uri)) {
        this.periodicView = new PeriodicView(uri);
        return this.periodicView;
      }
    }));
  },
  deactivate() {
    this.subscriptions.dispose();
    if (typeof this.periodicView !== 'undefined')
      this.periodicView.destroy();
  }
}

export default Periodic;
