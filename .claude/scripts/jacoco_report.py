"""
jacoco_report.py — Unified JaCoCo XML report parser.

Usage:
  python3 .claude/scripts/jacoco_report.py --summary <jacoco.xml> <threshold>
      Prints LINE coverage totals and exits with 0 (OK) or 1 (BELOW_THRESHOLD).
      Output: "LINE coverage: X/Y (Z.Z%)" then "OK" or "BELOW_THRESHOLD"

  python3 .claude/scripts/jacoco_report.py --detail <jacoco.xml> <threshold>
      Prints all counter type totals, then top-15 classes by missed lines.
      Prints "OK" or "BELOW_THRESHOLD" at the end.
"""
import sys
import xml.etree.ElementTree as ET


def parse(xml_path):
    tree = ET.parse(xml_path)
    return tree.getroot()


def summary(root, threshold):
    for c in root.findall('counter[@type="LINE"]'):
        missed = int(c.get('missed', 0))
        covered = int(c.get('covered', 0))
        total = missed + covered
        pct = (covered / total * 100) if total else 0
        print(f'LINE coverage: {covered}/{total} ({pct:.1f}%)')
        print('BELOW_THRESHOLD' if pct < threshold else 'OK')
        return int(pct < threshold)
    print('LINE coverage: 0/0 (0.0%)')
    print('BELOW_THRESHOLD')
    return 1


def detail(root, threshold):
    print('=== Bundle Totals ===')
    line_pct = 0
    for c in root.findall('counter'):
        missed = int(c.get('missed', 0))
        covered = int(c.get('covered', 0))
        total = missed + covered
        pct = (covered / total * 100) if total else 0
        print(f'{c.get("type"):15} {covered}/{total} ({pct:.1f}%)')
        if c.get('type') == 'LINE':
            line_pct = pct

    print()
    print('=== Classes by Missed Lines (worst first, top 15) ===')
    classes = []
    for cls in root.findall('package/class'):
        name = cls.get('name', '')
        for c in cls.findall('counter[@type="LINE"]'):
            missed = int(c.get('missed', 0))
            covered = int(c.get('covered', 0))
            if missed > 0:
                classes.append((missed, name, covered))
    for missed, name, covered in sorted(classes, reverse=True)[:15]:
        print(f'  missed={missed:4d}  covered={covered:4d}  {name}')

    print()
    print('BELOW_THRESHOLD' if line_pct < threshold else 'OK')
    return int(line_pct < threshold)


if __name__ == '__main__':
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(2)

    mode = sys.argv[1]
    xml_path = sys.argv[2]
    threshold = float(sys.argv[3])

    root = parse(xml_path)
    if mode == '--summary':
        sys.exit(summary(root, threshold))
    elif mode == '--detail':
        sys.exit(detail(root, threshold))
    else:
        print(f'Unknown mode: {mode}', file=sys.stderr)
        sys.exit(2)
