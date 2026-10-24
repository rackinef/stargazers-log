const repositoryList = document.querySelector("#repository-list");

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function renderRepositories(repositories) {
  repositoryList.replaceChildren();

  if (repositories.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "status-message";
    emptyMessage.textContent = "No starred repositories yet.";
    repositoryList.append(emptyMessage);
    return;
  }

  for (const repository of repositories) {
    const item = document.createElement("li");
    const card = document.createElement("article");
    const heading = document.createElement("h3");
    const link = document.createElement("a");
    const owner = document.createElement("p");
    const description = document.createElement("p");
    const date = document.createElement("p");

    card.className = "repository-card";
    link.href = repository.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = repository.name;
    owner.className = "repository-owner";
    owner.textContent = `by ${repository.owner}`;
    description.className = "repository-description";
    description.textContent = repository.description;
    date.className = "repository-date";
    date.textContent = `Starred ${formatDate(repository.starredAt)}`;

    heading.append(link);
    card.append(heading, owner, description, date);
    item.append(card);
    repositoryList.append(item);
  }
}

function hasRequiredFields(repository) {
  return (
    repository !== null &&
    typeof repository === "object" &&
    ["name", "owner", "description", "url", "starredAt"].every(
      (field) =>
        typeof repository[field] === "string" &&
        repository[field].trim().length > 0
    )
  );
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");

    if (!response.ok) {
      throw new Error(`Unable to load repositories (${response.status}).`);
    }

    const repositories = await response.json();

    if (!Array.isArray(repositories)) {
      throw new Error("Repository data must be a list.");
    }

    if (!repositories.every(hasRequiredFields)) {
      throw new Error("Each repository must include name, owner, description, url, and starredAt.");
    }

    renderRepositories(repositories);
  } catch (error) {
    const message = document.createElement("li");
    message.className = "status-message";
    message.setAttribute("role", "alert");
    message.textContent = "Could not load starred repositories. Please try again later.";
    repositoryList.replaceChildren(message);
    console.error(error);
  }
}

loadRepositories();
