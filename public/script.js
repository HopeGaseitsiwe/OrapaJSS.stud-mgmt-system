// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            navToggle.classList.toggle('active');
        });
    }
});


// ===============================
// DASHBOARD
// ===============================
async function loadDashboard() {
    try {
        const response = await fetch('/api/students');
        const result = await response.json();

        if (result.success) {
            // Statistics
            document.getElementById('total-count').textContent = result.stats.total;
            document.getElementById('form1-count').textContent = result.stats.form1;
            document.getElementById('form2-count').textContent = result.stats.form2;
            document.getElementById('form3-count').textContent = result.stats.form3;
            document.getElementById('male-count').textContent = result.stats.male;
            document.getElementById('female-count').textContent = result.stats.female;
            document.getElementById('acacia-count').textContent = result.stats.acacia;
            document.getElementById('baobab-count').textContent = result.stats.baobab;
            document.getElementById('palm-count').textContent = result.stats.palm;

            // Recent Students
            const recent = result.data.slice(-5).reverse();

            document.getElementById('recent-tbody').innerHTML = recent.map(s => `
                <tr>
                    <!-- ID -->
                    <td>
                        <span class="id-badge">
                            ${s.id}
                        </span>
                    </td>

                    <!-- STUDENT NAME -->
                    <td>
                        <strong>${s.student_name}</strong>
                    </td>

                    <!-- FORM -->
                    <td>
                        ${s.form || '-'}
                    </td>

                    <!-- CLASS -->
                    <td>
                        <span class="class-badge ${s.class?.replace(' ', '-') || ''}">
                            ${s.class || '-'}
                        </span>
                    </td>

                    <!-- GENDER -->
                    <td>
                        ${s.gender || '-'}
                    </td>

                    <!-- HOUSE -->
                    <td>
                        <span class="house-badge house-${s.house?.toLowerCase() || ''}">
                            ${s.house || '-'}
                        </span>
                    </td>

                    <!-- PRIMARY CONTACT -->
                    <td>
                        ${s.primary_contact || '-'}
                    </td>

                    <!-- SECONDARY CONTACT -->
                    <td>
                        ${s.secondary_contact || '-'}
                    </td>

                    <!-- GUARDIAN NAMES -->
                    <td>
                        ${s.guardian_names || '-'}
                    </td>
                </tr>
            `).join('');
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}


// ===============================
// AUTO LOAD DASHBOARD
// ===============================
if (document.getElementById('total-count')) {
    loadDashboard();
}