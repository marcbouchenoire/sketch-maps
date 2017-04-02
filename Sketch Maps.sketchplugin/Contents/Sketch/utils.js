//--------------------------------------//
//               Context                //
//--------------------------------------//

var app = NSApplication.sharedApplication(),
    selection,
    plugin,
    doc,
    page,
    artboard;

function initContext(context) {
  doc = context.document,
  plugin = context.plugin,
  page = doc.currentPage(),
  artboard = page.currentArtboard(),
  selection = context.selection,
  token = "pk.eyJ1IjoiYm91Y2hlbm9pcmVtYXJjIiwiYSI6ImNpemVrd2I5MjAwNTIzM21kOXRiaGRmdnQifQ.UayfYRVvNDSyy2bo23db9w";
}

//--------------------------------------//
//                  URL                 //
//--------------------------------------//

function get(url) {
  var request = NSURLRequest.requestWithURL(NSURL.URLWithString(url));
  var response = NSURLConnection.sendSynchronousRequest_returningResponse_error(request, null, null);

  return response
}

//--------------------------------------//
//             Layer Types              //
//--------------------------------------//

var is = {
  it: function (layer, layerClass) {
    return layer.class() === layerClass
  },
  page : function (layer) {
    return is.it(layer, MSPage)
  },
  artboard : function (layer) {
    return is.it(layer, MSArtboardGroup)
  },
  group : function (layer) {
    return is.it(layer, MSLayerGroup)
  },
  text : function (layer) {
    return is.it(layer, MSTextLayer)
  },
  shape : function (layer) {
    return is.it(layer, MSShapeGroup)
  }
}

//--------------------------------------//
//               Sketch UI              //
//--------------------------------------//

function showMessage(message) {
  doc.showMessage(message)
}

function displayDialog(message, title) {
  if (title) {
    app.displayDialog(message).withTitle(title)
  } else {
    app.displayDialog(message)
  }
}

//--------------------------------------//
//                Cocoa                 //
//--------------------------------------//

function toNSString(data) {
  return NSString.alloc().initWithData_encoding(data, NSUTF8StringEncoding);
}

function createLabel(text, fontSize, bold, frame, opacity) {
  var label = NSTextField.alloc().initWithFrame(frame)
  label.setStringValue(text)
  label.setFont((bold) ? NSFont.boldSystemFontOfSize(fontSize) : NSFont.systemFontOfSize(fontSize))
  label.setBezeled(false)
  label.setDrawsBackground(false)
  label.setEditable(false)
  label.setSelectable(false)
  if (opacity) label.setAlphaValue(opacity)

  return label
}

function createTextField(value, placeholder, frame) {
  var textfield = NSTextField.alloc().initWithFrame(frame)
  textfield.cell().setWraps(false);
  textfield.cell().setScrollable(true);
  textfield.setStringValue(value);
  if (placeholder) textfield.setPlaceholderString(placeholder);

  return textfield
}

function createDropdown(values, frame){
  var dropdown = NSPopUpButton.alloc().initWithFrame(frame)
  dropdown.addItemsWithTitles(values)

  return dropdown
}

function createWindow() {
  var alert = COSAlertWindow.new()
  alert.addButtonWithTitle("OK")
  alert.addButtonWithTitle("Cancel")
  alert.setMessageText("Sketch Maps")
  alert.setInformativeText("Enter an address to fill the selected layer with a map. If you hide the watermarks, you are legally required to include proper attribution elsewhere in the document.")
  alert.setIcon(NSImage.alloc().initByReferencingFile(plugin.urlForResourceNamed("icon@2x.png").path()));

  var addressLabel = createLabel("Address", 12, true, NSMakeRect(0, 0, 300, 16)),
  addressTextField = createTextField("", "La Tour Eiffel, Paris, France", NSMakeRect(0, 0, 300, 24)),
  optionsView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 136)),
  optionsLabel = createLabel("Options", 12, true, NSMakeRect(0, 110, 300, 16)),
  zoomLabel = createLabel("Zoom", 12, false, NSMakeRect(0, 86, 300, 16)),
  zoomRangeLabel = createLabel("(20)", 12, false, NSMakeRect(36, 86, 300, 16), 0.3),
  zoomTextField = createTextField("16", null, NSMakeRect(0, 56, 90, 24)),
  bearingLabel = createLabel("Bearing", 12, false, NSMakeRect(105, 86, 300, 16)),
  bearingRangeLabel = createLabel("(360)", 12, false, NSMakeRect(152, 86, 300, 16), 0.3),
  bearingTextField = createTextField("0", null, NSMakeRect(105, 56, 90, 24)),
  pitchLabel = createLabel("Pitch", 12, false, NSMakeRect(210, 86, 300, 16)),
  pitchRangeLabel = createLabel("(60)", 12, false, NSMakeRect(242, 86, 300, 16), 0.3),
  pitchTextField = createTextField("0", null, NSMakeRect(210, 56, 90, 24)),
  styleLabel = createLabel("Style", 12, false, NSMakeRect(0, 30, 300, 16)),
  styleDropdown = createDropdown(["Streets", "Satellite", "Outdoors", "Light", "Dark"], NSMakeRect(-2, -1, 96, 24)),
  customLabel = createLabel("Custom Style URL", 12, false, NSMakeRect(105, 30, 300, 16)),
  customOptionalLabel = createLabel("(Optional)", 12, false, NSMakeRect(211, 30, 300, 16), 0.3),
  customTextField = createTextField("", "mapbox://styles/", NSMakeRect(105, 0, 195, 24));

  alert.addAccessoryView(addressLabel);
  alert.addAccessoryView(addressTextField);
  optionsView.addSubview(optionsLabel);
  optionsView.addSubview(zoomLabel);
  optionsView.addSubview(zoomRangeLabel);
  optionsView.addSubview(zoomTextField);
  optionsView.addSubview(bearingLabel);
  optionsView.addSubview(bearingRangeLabel);
  optionsView.addSubview(bearingTextField);
  optionsView.addSubview(pitchLabel);
  optionsView.addSubview(pitchRangeLabel);
  optionsView.addSubview(pitchTextField);
  optionsView.addSubview(styleLabel);
  optionsView.addSubview(styleDropdown);
  optionsView.addSubview(customLabel);
  optionsView.addSubview(customOptionalLabel);
  optionsView.addSubview(customTextField);
  alert.addAccessoryView(optionsView);

  alert.alert().window().setInitialFirstResponder(addressTextField);
  addressTextField.setNextKeyView(zoomTextField);
  zoomTextField.setNextKeyView(bearingTextField);
  bearingTextField.setNextKeyView(pitchTextField);

  var inputs = [addressTextField, zoomTextField, bearingTextField, pitchTextField, styleDropdown, customTextField];

  return [alert, inputs]
}
