import fs from 'fs';

let html = fs.readFileSync('test-profile.html', 'utf8');

const badgeHTML = `
<div class='profile-badge'>
<a class="badge-image" href="https://www.skills.google/public_profiles/09886862-52b8-44a4-86a5-9559a3952dd0/badges/99999999"><img role="presentation" src="https://cdn.qwiklabs.com/V5hy7oPDiKov68Q4kTcuuA%2BMHNMX3Z0my4mncKPPGvY%3D" />
</a><span class='ql-title-medium l-mts'>
AntiGravity Advanced Orchestration
</span>
<span class='ql-body-medium l-mbs'>
Earned Jun 13, 2026 EDT
</span>
<ql-button ariaLabel='Learn more about AntiGravity Advanced Orchestration' label='Learn more' modal='public-profile-award-modal-999' outlined tip='Learn more'></ql-button>
</div>
`;

html = html.replace("<div class='profile-badges'>", "<div class='profile-badges'>" + badgeHTML);
fs.writeFileSync('test-profile-modified.html', html);
console.log('Injected test badge.');
