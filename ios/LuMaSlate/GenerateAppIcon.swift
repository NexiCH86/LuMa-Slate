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
NSColor(calibratedRed: 26/255, green: 38/255, blue: 41/255, alpha: 1).setFill()
bg.fill()

func fillPolygon(_ points: [CGPoint], color: NSColor) {
    let p = NSBezierPath()
    guard let first = points.first else { return }
    p.move(to: first)
    for point in points.dropFirst() { p.line(to: point) }
    p.close()
    color.setFill()
    p.fill()
}

let cyan = NSColor(calibratedRed: 0/255, green: 215/255, blue: 230/255, alpha: 1)
let cyan2 = NSColor(calibratedRed: 0/255, green: 175/255, blue: 194/255, alpha: 1)

fillPolygon([
    CGPoint(x: 155, y: 844), CGPoint(x: 155, y: 234), CGPoint(x: 470, y: 234),
    CGPoint(x: 410, y: 294), CGPoint(x: 225, y: 294), CGPoint(x: 225, y: 844)
], color: cyan)

fillPolygon([
    CGPoint(x: 330, y: 694), CGPoint(x: 510, y: 514), CGPoint(x: 705, y: 724),
    CGPoint(x: 705, y: 289), CGPoint(x: 775, y: 234), CGPoint(x: 775, y: 844),
    CGPoint(x: 510, y: 594), CGPoint(x: 330, y: 774)
], color: cyan2)

func stroke(_ points: [CGPoint]) {
    let p = NSBezierPath()
    guard let first = points.first else { return }
    p.move(to: first)
    for point in points.dropFirst() { p.line(to: point) }
    p.lineWidth = 18
    p.lineJoinStyle = .round
    cyan.setStroke()
    p.stroke()
}

stroke([CGPoint(x: 760, y: 839), CGPoint(x: 835, y: 874), CGPoint(x: 910, y: 839), CGPoint(x: 835, y: 804), CGPoint(x: 760, y: 839)])
stroke([CGPoint(x: 760, y: 796), CGPoint(x: 835, y: 761), CGPoint(x: 910, y: 796)])
stroke([CGPoint(x: 760, y: 762), CGPoint(x: 835, y: 727), CGPoint(x: 910, y: 762)])

image.unlockFocus()

guard let tiff = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: tiff),
      let png = bitmap.representation(using: .png, properties: [:]) else {
    fatalError("Could not encode PNG")
}

let output = URL(fileURLWithPath: CommandLine.arguments[1])
try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
try png.write(to: output)
print("Generated LuMa Slate app icon at \(output.path)")
