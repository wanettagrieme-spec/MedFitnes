// Распознавание текста в сканированных PDF встроенным Apple Vision (русский + английский).
// usage: swift scripts/ocr_pdf.swift <file.pdf> <out.txt>
import Foundation
import PDFKit
import Vision
import AppKit

let args = CommandLine.arguments
guard args.count >= 3, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
  FileHandle.standardError.write("usage: ocr_pdf.swift <file.pdf> <out.txt>\n".data(using: .utf8)!); exit(1)
}
var out = ""
for i in 0..<doc.pageCount {
  guard let page = doc.page(at: i) else { continue }
  let box = page.bounds(for: .mediaBox)
  let scale: CGFloat = 2.5
  let size = NSSize(width: box.width * scale, height: box.height * scale)
  let img = page.thumbnail(of: size, for: .mediaBox)
  var text = ""
  if let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) {
    let req = VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.recognitionLanguages = ["ru-RU", "en-US"]
    req.usesLanguageCorrection = true
    try? VNImageRequestHandler(cgImage: cg, options: [:]).perform([req])
    let obs = (req.results ?? []).sorted { a, b in
      abs(a.boundingBox.midY - b.boundingBox.midY) > 0.01 ? a.boundingBox.midY > b.boundingBox.midY : a.boundingBox.minX < b.boundingBox.minX
    }
    text = obs.compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
  }
  out += "=== стр. \(i + 1)\n\(text)\n"
}
try out.write(toFile: args[2], atomically: true, encoding: .utf8)
print("\(doc.pageCount) стр. → \(args[2]) (\(out.count) симв.)")
