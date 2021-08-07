import { token } from './config.js'

class GitHub {
    constructor() {
        this.repo_count = 5;
        this.repos_sort = 'created: asc';
    }
    async getUser(username) {
        // retrieve user profile and repo
        const profileResponse = await fetch(`https://api.github.com/users/${username}?`, {
            headers: {
                Authorization: `token ${token}`
            }
        });
        const repoResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=${this.repo_count}&sort=${this.repos_sort}`, {
            headers: {
                Authorization: `token ${token}`
            }
        });

        // store user profile and repo as JSON
        const profile = await profileResponse.json();
        const repos = await repoResponse.json();

        return {
            profile: profile,
            repos: repos
        }
    }
}

class UI {
    constructor() {
        this.profile = document.getElementById('profile');
    }
    showProfile(user) {
        this.profile.innerHTML = `
        <div class="card card-body mb-3">
            <div class="row">
                <div class="col-md-3">
                    <img class="img-fluid mb-2" src="${user.avatar_url}">
                    <a href="${user.html_url}" target="_blank" class="btn btn-primary btn-block mb-4">View Profile</a>
                </div>
                <div class="col-md-9">
                    <span class="badge badge-primary">Public Repos: ${user.public_repos}</span>
                    <span class="badge badge-warning">Public Gists: ${user.public_gists}</span>
                    <span class="badge badge-success">Followers: ${user.followers}</span>
                    <span class="badge badge-info">Following: ${user.following}</span>
                    <br><br>
                    <ul class="list-group">
                        <li class="list-group-item">Company: ${user.company === null ? 'N/A' : user.company}</li>
                        <li class="list-group-item">Website/Blog: ${user.blog === '' ? 'N/A' : user.blog}</li>
                        <li class="list-group-item">Location: ${user.location === null ? 'N/A' : user.location}</li>
                        <li class="list-group-item">Member Since: ${user.created_at === null ? 'N/A' : user.created_at}</li>
                    </ul>
                </div>
            </div>
        </div>
        <h3 class="page-heading mb-3">Latest Repos</h3>
        <div id="repos"></div>`;
    }
    // display repos
    showRepos(user, repos) {
        let output = '';
        if (repos.length > 0) {
            repos.forEach(repo => {
                output += `
                <div class="card card-body mb-3">
                    <div class="row">
                        <div class="col-md-6">
                            <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                        </div>
                        <div class="col-md-6">
                            <span class="badge badge-primary">Stars: ${repo.stargazers_count}</span>
                            <span class="badge badge-warning">Watchers: ${repo.watchers_count}</span>
                            <span class="badge badge-success">Forks: ${repo.forks_count}</span>
                        </div>
                    </div>
                </div>`
            });
        } else {
            output = `
            <div class="card card-body mb-3">
                <div class="row">
                    <div class="col-md-6">
                        <em>${user.login}</em> doesn’t have any public repositories yet.
                    </div>
                </div>
            </div>`
        }
        document.getElementById('repos').innerHTML = output;
    }
    // display error alerts
    showAlert(msg, classes) {
        // create div
        const div = document.createElement('div');
        // add classes
        div.className = classes;
        // add text
        div.appendChild(document.createTextNode(msg));
        // insert alert
        document.getElementById('profile').appendChild(div);

    }
    // clear alert message
    clearAlert() {
        if (document.getElementsByClassName('alert-danger').length > 0) {
            document.querySelector('.alert-danger').remove();
        }
    }
    // clear profile
    clearProfile() {
        this.profile.innerHTML = '';
    }
}

// Initialize UI
const ui = new UI();
// Initialize GitHub
const gitHub = new GitHub();

// Input Field
const searchUser = document.getElementById('search-user');

// Remove Border On Input Focus (styling reasons)
searchUser.addEventListener('focus', () => {
    searchUser.style.border = 'none';
});

// Add Border Back on Blur (styling reasons)
searchUser.addEventListener('blur', () => {
    searchUser.style.border = '1px solid #ced4da';
});

// Search Input
searchUser.addEventListener('input', (e) => {
    // get text being typed in
    const userText = e.target.value;
    if (userText !== '') {
        // make http call
        gitHub.getUser(userText)
            .then(data => {
                if (data.profile.message === 'Not Found') {
                    // show alert
                    if (document.getElementsByClassName('alert-danger').length < 1) {
                        ui.clearProfile();
                        ui.showAlert('User not found.', 'alert alert-danger');
                    }
                } else {
                    // clear any previous alerts
                    ui.clearAlert();
                    // show profile
                    ui.showProfile(data.profile);
                    ui.showRepos(data.profile, data.repos);
                }
            });
    } else {
        // clear any previous alerts
        ui.clearAlert();
        // clear profile
        ui.clearProfile();
        ui.clearAlert();
    }
});