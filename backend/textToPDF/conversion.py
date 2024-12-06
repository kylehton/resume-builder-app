from fpdf import FPDF


class ResumePDF(FPDF):
    def add_text(self, text, bold=False, enlarged=False):
        if bold:
            self.set_font("Arial", style="B", size=14 if enlarged else 12)
        else:
            self.set_font("Arial", size=12)
        self.multi_cell(0, 10, text)
        self.ln()

    def add_line_break(self):
        self.ln(5)


def parse_and_generate_pdf(plain_text, output_filename="Resume.pdf"):
    pdf = ResumePDF()
    pdf.add_page()

    lines = plain_text.strip().split("\n")
    enlarge_next = False

    for line in lines:
        line = line.strip()

        if line == "---":
            # Next line should be enlarged and bold
            enlarge_next = True
        elif enlarge_next:
            # Enlarged and bold text
            pdf.add_text(line, bold=True, enlarged=True)
            enlarge_next = False
        elif "**" in line:
            # Bold text between **
            parts = line.split("**")
            for i, part in enumerate(parts):
                if i % 2 == 1:  # Bold
                    pdf.add_text(part, bold=True)
                else:  # Plain text
                    pdf.add_text(part)
        else:
            # Plain text
            pdf.add_text(line)

    # Save the PDF
    pdf.output(output_filename)


# Example Input
plain_text = """
**John Doe**
**linkedin.com/in/johndoe**
**johndoe@example.com**

---

Professional Experience

Developed AI-driven applications.
Collaborated with a team of developers.

---

Skills

Python, React, FastAPI
"""

# Generate the PDF
parse_and_generate_pdf(plain_text)
