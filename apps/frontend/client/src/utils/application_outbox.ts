import Constants from "expo-constants";

export const createApplicationOutbox = async (title: string, body: string, label: string = "") => {
    const token = Constants.manifest?.extra?.GITHUB_OUTBOX_TOKEN?? "ghp_[RETRACTED]";
    const owner = Constants.manifest?.extra?.GITHUB_OUTBOX_OWNER ?? "https-multiculturaltoolbox-com";
    const repo = Constants.manifest?.extra?.GITHUB_OUTBOX_REPO ?? "edge7_application_outbox";

    try {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/issues`,
            {
                method: "POST",
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title ?? "Bug: Login button not working",
                    body: body ?? "Steps:\n1. Open app\n2. Tap login\n3. Nothing happens",
                    labels: [label],
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create issue");
        }

        // console.log("Issue created:", data.html_url);
    } catch (error) {
        //console.error("Error creating issue:", error);
    }
};
