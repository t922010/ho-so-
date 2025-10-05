const classes = [];
const totalClasses = 45;
const studentsPerClass = 45;

for (let i = 1; i <= totalClasses; i++) {
  const className = `Lớp ${i}`;
  const students = [];
  for (let j = 1; j <= studentsPerClass; j++) {
    students.push({ name: `HS ${j}`, present: false, absentExcused: false, absentUnexcused: false });
  }
  classes.push({ name: className, students });
}

function renderClasses() {
  const container = document.getElementById("classesContainer");
  container.innerHTML = classes.map((cls, index) => `
    <details>
      <summary>${cls.name}</summary>
      <div class="class-card">
        <table>
          <thead>
            <tr>
              <th>STT</th><th>Tên học sinh</th><th>Điểm danh</th><th>Có phép</th><th>Không phép</th>
            </tr>
          </thead>
          <tbody>
            ${cls.students.map((student, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td contenteditable="true" onblur="classes[${index}].students[${idx}].name = this.textContent">${student.name}</td>
                <td><input type="checkbox" onchange="classes[${index}].students[${idx}].present = this.checked" ${student.present ? 'checked' : ''}></td>
                <td><input type="checkbox" onchange="classes[${index}].students[${idx}].absentExcused = this.checked" ${student.absentExcused ? 'checked' : ''}></td>
                <td><input type="checkbox" onchange="classes[${index}].students[${idx}].absentUnexcused = this.checked" ${student.absentUnexcused ? 'checked' : ''}></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </details>
  `).join("");
}

function addClass() {
  const newClassName = prompt("Nhập tên lớp mới:");
  if (newClassName) {
    classes.push({
      name: newClassName,
      students: Array.from({ length: studentsPerClass }, (_, i) => ({
        name: `HS ${i + 1}`,
        present: false,
        absentExcused: false,
        absentUnexcused: false
      }))
    });
    renderClasses();
  }
}

function deleteClass() {
  const classToDelete = prompt("Nhập tên lớp cần xóa:");
  if (classToDelete) {
    const index = classes.findIndex(cls => cls.name === classToDelete);
    if (index !== -1) {
      classes.splice(index, 1);
      renderClasses();
    } else {
      alert("Không tìm thấy lớp!");
    }
  }
}

function exportAbsent() {
  const absentList = [];
  classes.forEach(cls => {
    cls.students.forEach(student => {
      if (student.absentExcused || student.absentUnexcused) {
        absentList.push({
          "Lớp": cls.name,
          "Họ tên": student.name,
          "Có phép": student.absentExcused ? "x" : "",
          "Không phép": student.absentUnexcused ? "x" : ""
        });
      }
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(absentList);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Vắng học");
  XLSX.writeFile(workbook, `HocSinhNghi_${new Date().toISOString().slice(0,10)}.xlsx`);
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchClass");
  if (searchInput) {
    searchInput.addEventListener("input", renderClasses);
  }
  renderClasses();
});

