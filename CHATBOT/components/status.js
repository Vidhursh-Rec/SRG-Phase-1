function initializeStatus() {

    const RESULT_CLASSES = [
        "pass", "fail", "pending",
        "refining", "escalated", "blocked"
    ];

    const OVERALL_CLASSES = [
        "refining", "escalated", "blocked", "fail"
    ];


    window.updateSRGStatus = function (result) {

        const overall = document.getElementById("overall-status");
        const overallText = document.getElementById("overall-status-text");

        const confidentiality = document.getElementById("confidentiality-status");
        const policy = document.getElementById("policy-status");
        const review = document.getElementById("review-status");
        const error = document.getElementById("error-status");
        const refine = document.getElementById("refine-status");

        // Overall status (text + colour)
        overall.classList.remove(...OVERALL_CLASSES);

        if (result.escalated) {
            overallText.textContent = "ESCALATED";
            overall.classList.add("escalated");
        } else if (result.attempts_used > 0) {
            overallText.textContent = "REFINED";
            overall.classList.add("refining");
        } else {
            overallText.textContent = "ACTIVE";
        }

        // Confidentiality
        setStatus(confidentiality, result.v2, "✓ PASS", "✗ FAIL");

        // Policy / Review Agent
        setStatus(policy, result.v1, "✓ PASS", "✗ FAIL");
        setStatus(review, result.v1, "✓ PASS", "✗ FAIL");

        // Error Checker
        setStatus(error, result.v2, "✓ PASS", "✗ FAIL");

        // Self-Refine
        if (result.attempts_used > 0) {

            if (result.escalated) {
                setStatusText(refine, "✗ ESCALATED", "escalated");
            } else {
                setStatusText(refine, "✓ REFINED", "pass");
            }

        } else {
            setStatusText(refine, "—", "pending");
        }
    };


    function setStatus(element, passed, passText, failText) {

        if (passed) {
            setStatusText(element, passText, "pass");
        } else {
            setStatusText(element, failText, "fail");
        }

    }


    function setStatusText(element, text, className) {

        element.textContent = text;

        element.classList.remove(...RESULT_CLASSES);
        element.classList.add(className);

    }

}