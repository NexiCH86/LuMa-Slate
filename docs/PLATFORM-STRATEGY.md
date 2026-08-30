# LuMa Slate Platform Strategy

Status: verbindliche Produktarchitektur

LuMa Slate wird als plattformübergreifender Workspace entwickelt. BOOX ist die erste Referenzplattform, aber der gemeinsame Produktkern darf nicht dauerhaft an BOOX oder Android gekoppelt werden.

## Zielplattformen

- Android E-Ink Tablets, insbesondere BOOX
- Android Color Tablets, insbesondere Samsung Galaxy Tab / S Pen / DeX
- iPadOS Tablets / Apple Pencil
- später optional Windows und macOS

## Architekturprinzip

LuMa Slate Core enthält plattformunabhängige UI, Navigation, Library-Metadaten, Reading State, Annotation-Datenmodell, Notes, Work, LuMa AI Context, Sync-State und Einstellungen.

Native Bridges kapseln gerätespezifische Fähigkeiten:

- Android/BOOX Bridge: Storage Access Framework, PdfRenderer, Android Systemdaten, Stylus Pointer Events, spätere BOOX-spezifische Optimierungen
- Android/Samsung Bridge: gemeinsamer Android-Unterbau plus S-Pen-, DeX- und Color-Display-Profil
- iPadOS Bridge: Swift, UIDocumentPicker, PDFKit, PencilKit und iPadOS-Systemintegration

## Darstellungsprofile

- E-Ink: hoher Kontrast, minimale Animationen, klare Flächen, E-Ink-taugliche Farben und Refresh-schonende Interaktion
- Android Color: volle LuMa Labs Farbwelt, flüssigere Interaktionen, Multitasking und DeX
- iPadOS: iPad-optimierte Touch-/Pencil-Interaktion bei gleichem LuMa Slate Produktmodell

## V1.0-Regel

BOOX bleibt die erste V1.0-Referenz. Neue Core-Funktionen werden ab sofort so geschrieben, dass Plattformlogik über Bridge-Funktionen abstrahiert wird. Gerätespezifische APIs dürfen den gemeinsamen Datenbestand nicht definieren.

## Gemeinsame Datenmodelle

Persistente Daten werden möglichst portabel und versioniert gespeichert: Dokument-Metadaten, Reading State, Annotationen, Notizen, Projekte, AI-Kontext und Sync-Metadaten. Dadurch sollen Geräte später denselben LuMa-Slate-Datenbestand über LuMa Sync/LuisServer verwenden können.
