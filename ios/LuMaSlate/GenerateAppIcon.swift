import AppKit

let size = NSSize(width: 1024, height: 1024)
let image = NSImage(size: size)
image.lockFocus()

guard let context = NSGraphicsContext.current?.cgContext else {
    fatalError("No graphics context")
}

context.setFillColor(NSColor(calibratedRed: 22/255, green: 31/255, blue: 34/255, alpha: 1).cgColor)
context.fill(CGRect(origin: .zero, size: size))

let bg = NSBezierPath(roundedRect: NSRect(x: 36, y: 36, width: 952, height: 952), xRadius: 220, yRadius: 220)
NSColor(calibratedRed: 28/255, green: 40/255, blue: 44/255, alpha: 1).setFill()
bg.fill()

// BOG Note "BN" monogram (Abicht blue + gold). Coordinates: y measured from bottom (AppKit).
let blue = NSColor(calibratedRed: 0/255, green: 145/255, blue: 186/255, alpha: 1)
let blueLight = NSColor(calibratedRed: 51/255, green: 167/255, blue: 203/255, alpha: 1)
let gold = NSColor(calibratedRed: 188/255, green: 169/255, blue: 91/255, alpha: 1)

func polygon(_ points: [CGPoint], into path: NSBezierPath) {
    guard let first = points.first else { return }
    path.move(to: first)
    for point in points.dropFirst() { path.line(to: point) }
    path.close()
}

func fillPolygons(_ shapes: [[CGPoint]], color: NSColor, evenOdd: Bool = false) {
    let p = NSBezierPath()
    if evenOdd { p.windingRule = .evenOdd }
    for shape in shapes { polygon(shape, into: p) }
    color.setFill()
    p.fill()
}

// B with two counters
fillPolygons([
    [CGPoint(x: 150, y: 824), CGPoint(x: 400, y: 824), CGPoint(x: 460, y: 764), CGPoint(x: 460, y: 604),
     CGPoint(x: 425, y: 569), CGPoint(x: 470, y: 524), CGPoint(x: 470, y: 260), CGPoint(x: 410, y: 200), CGPoint(x: 150, y: 200)],
    [CGPoint(x: 220, y: 759), CGPoint(x: 375, y: 759), CGPoint(x: 395, y: 739), CGPoint(x: 395, y: 624), CGPoint(x: 375, y: 604), CGPoint(x: 220, y: 604)],
    [CGPoint(x: 220, y: 534), CGPoint(x: 390, y: 534), CGPoint(x: 405, y: 519), CGPoint(x: 405, y: 285), CGPoint(x: 385, y: 265), CGPoint(x: 220, y: 265)]
], color: blue, evenOdd: true)

// N stems
fillPolygons([[CGPoint(x: 560, y: 200), CGPoint(x: 630, y: 200), CGPoint(x: 630, y: 824), CGPoint(x: 560, y: 824)]], color: blue)
fillPolygons([[CGPoint(x: 804, y: 200), CGPoint(x: 874, y: 200), CGPoint(x: 874, y: 824), CGPoint(x: 804, y: 824)]], color: blueLight)

// N diagonal as gold pen stroke
fillPolygons([[CGPoint(x: 560, y: 824), CGPoint(x: 642, y: 824), CGPoint(x: 874, y: 282),
               CGPoint(x: 874, y: 200), CGPoint(x: 792, y: 200), CGPoint(x: 560, y: 742)]], color: gold)

image.unlockFocus()

guard let tiff = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: tiff),
      let png = bitmap.representation(using: .png, properties: [:]) else {
    fatalError("Could not encode PNG")
}

let output = URL(fileURLWithPath: CommandLine.arguments[1])
try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
try png.write(to: output)
print("Generated BOG Note app icon at \(output.path)")
