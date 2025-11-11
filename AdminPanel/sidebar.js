const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// Load sidebar
fetch('sidebar-content.html')
  .then(res => res.text())
  .then(html => {
    $('sidebarContainer').innerHTML = html;
    initSidebar();
    loadPage('maindashboard.html');
  })
  .catch(err => console.error('Sidebar load failed:', err));

function initSidebar() {
  const sidebar = $('sidebar');
  const floatingDropdown = $('floatingDropdown');
  let hoverTimeout, currentLink, overFloat = false, overLink = false;

  $('toggleSidebarBtn').onclick = (e) => {
    e.preventDefault();
    sidebar.classList.toggle('collapsed');
    floatingDropdown.classList.remove('show');
    $$('.dropdown-menu-custom').forEach(d => d.classList.remove('show'));
    $$('.arrow-icon').forEach(a => a.classList.remove('rotated'));
    updateContentMargin();
  };

  $('mobileMenuBtn').onclick = () => sidebar.classList.toggle('mobile-open');

  document.onclick = (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !$('mobileMenuBtn').contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
    if (!sidebar.contains(e.target) && !floatingDropdown.contains(e.target)) {
      floatingDropdown.classList.remove('show');
    }
  };

  $$('.dropdown-toggle-custom').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      if (!sidebar.classList.contains('collapsed')) {
        const dropdown = $(link.dataset.dropdown);
        const arrow = link.querySelector('.arrow-icon');
        $$('.dropdown-menu-custom').forEach(d => d !== dropdown && d.classList.remove('show'));
        $$('.arrow-icon').forEach(a => a !== arrow && a.classList.remove('rotated'));
        dropdown.classList.toggle('show');
        arrow?.classList.toggle('rotated');
      }
    };

    link.onmouseenter = () => {
      if (sidebar.classList.contains('collapsed')) {
        overLink = true;
        clearTimeout(hoverTimeout);
        currentLink = link;
        showFloat(link);
      }
    };

    link.onmouseleave = () => {
      if (sidebar.classList.contains('collapsed')) {
        overLink = false;
        hoverTimeout = setTimeout(() => !overFloat && !overLink && floatingDropdown.classList.remove('show'), 150);
      }
    };
  });

  floatingDropdown.onmouseenter = () => {
    overFloat = true;
    clearTimeout(hoverTimeout);
  };

  floatingDropdown.onmouseleave = () => {
    overFloat = false;
    hoverTimeout = setTimeout(() => !overLink && !overFloat && floatingDropdown.classList.remove('show'), 150);
  };

  function showFloat(link) {
    const dropdown = $(link.dataset.dropdown);
    if (!dropdown) return;
    
    const title = link.dataset.title;
    const rect = link.getBoundingClientRect();
    const items = dropdown.querySelectorAll('.nav-link');
    
    let html = `<div class="floating-dropdown-title">${title}</div>`;
    items.forEach(item => {
      const itemTitle = item.dataset.title;
      const itemPage = item.dataset.page || '';
      const icon = item.querySelector('i')?.outerHTML || '<i class="far fa-circle"></i>';
      html += `<a class="dropdown-item" href="#" data-item="${itemTitle}" data-page="${itemPage}">${icon}<span>${itemTitle}</span></a>`;
    });

    floatingDropdown.innerHTML = html;
    floatingDropdown.style.top = rect.top + 'px';
    floatingDropdown.classList.add('show');

    floatingDropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.onclick = (e) => {
        e.preventDefault();
        if (item.dataset.page) {
          loadPage(item.dataset.page);
        }
        $$('.nav-link').forEach(l => l.classList.remove('active'));
        floatingDropdown.classList.remove('show');
      };
    });
  }

  sidebar.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-link');
    if (link && !link.classList.contains('dropdown-toggle-custom')) {
      e.preventDefault();
      console.log('Link clicked:', link.dataset.title, 'Page:', link.dataset.page);
      if (link.dataset.page) {
        loadPage(link.dataset.page);
        $$('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
      if (window.innerWidth <= 768) sidebar.classList.remove('mobile-open');
    }
  });

  sidebar.onscroll = () => sidebar.classList.contains('collapsed') && floatingDropdown.classList.remove('show');
}

function loadPage(url) {
  console.log('Loading page:', url);
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Page not found');
      return response.text();
    })
    .then(html => {
      console.log('Page loaded successfully');
      $('contentArea').innerHTML = html;
      executeScripts($('contentArea'));
    })
    .catch(error => {
      console.error('Error loading page:', error);
      $('contentArea').innerHTML = '<div class="alert alert-danger m-4">Error loading page: ' + url + '</div>';
    });
}

function executeScripts(container) {
  const scripts = container.querySelectorAll('script');
  scripts.forEach(oldScript => {
    const newScript = document.createElement('script');
    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
}

function updateContentMargin() {
  const sidebar = $('sidebar');
  const content = $('contentArea');
  if (sidebar.classList.contains('collapsed')) {
    content.style.marginLeft = '80px';
  } else {
    content.style.marginLeft = '280px';
  }
}
