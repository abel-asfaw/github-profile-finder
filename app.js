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
    // display user profile and its information
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
                </div>`;
            });
        } else {
            output = `
            <div class="card card-body mb-3">
                <div class="row">
                    <div class="col-md-6">
                        <em>${user.login}</em> doesn’t have any public repositories yet.
                    </div>
                </div>
            </div>`;
        }
        document.getElementById('repos').innerHTML = output;
    }
    // display error message
    showAlert(msg, classes) {
        const div = document.createElement('div');
        div.className = classes;
        div.appendChild(document.createTextNode(msg));
        document.getElementById('profile').appendChild(div);
    }
    clearAlert() {
        if (document.getElementsByClassName('alert-danger').length > 0) {
            document.querySelector('.alert-danger').remove();
        }
    }
    clearProfile() {
        this.profile.innerHTML = '';
    }
}

// initialize UI object
const ui = new UI();
// initialize GitHub profile object
const gitHub = new GitHub();
// grab search field
const searchUser = document.getElementById('search-user');

// remove border on input focus (styling reasons)
searchUser.addEventListener('focus', () => {
    searchUser.style.border = 'none';
});

// add border back on blur (styling reasons)
searchUser.addEventListener('blur', () => {
    searchUser.style.border = '1px solid #ced4da';
});

// grab input as it's being typed in the search field and display results
searchUser.addEventListener('input', (e) => {
    const userText = e.target.value;
    if (userText !== '') {
        gitHub.getUser(userText)
            .then(data => {
                if (data.profile.message === 'Not Found') {
                    // show alert if username is not found
                    if (document.getElementsByClassName('alert-danger').length < 1) {
                        ui.clearProfile();
                        ui.showAlert('User not found.', 'alert alert-danger');
                    }
                } else {
                    // clear any previous error alerts and show profile if found
                    ui.clearAlert();
                    ui.showProfile(data.profile);
                    ui.showRepos(data.profile, data.repos);
                }
            });
    } else {
        // clear any previous error alerts and clear profile
        ui.clearAlert();
        ui.clearProfile();
        ui.clearAlert();
    }
});
