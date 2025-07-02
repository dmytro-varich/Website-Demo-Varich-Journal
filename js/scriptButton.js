let activeLinkId = "link0";

export function activateLink(linkId) {
    if (linkId !== activeLinkId && activeLinkId !== "link4" && activeLinkId !== "link5") {
        var activeLink = document.getElementById(activeLinkId);
        activeLink.classList.remove("active");
    }

    var newActiveLink = document.getElementById(linkId);
    newActiveLink.classList.add("active");
    activeLinkId = linkId;
}