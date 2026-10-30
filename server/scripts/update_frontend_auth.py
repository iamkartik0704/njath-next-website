import os

WORKSPACE = r"C:\Users\iamka\Desktop\njath\njath-next-website"

# 1. Update src/pages/levels.js
levels_path = os.path.join(WORKSPACE, "src", "pages", "levels.js")
with open(levels_path, "r", encoding="utf-8") as f:
    levels_content = f.read()

old_levels_target = """    useEffect(() => {
        // Only fetch if we're not already loading auth state"""

new_levels_replacement = """    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromUrl = urlParams.get("token");
            if (tokenFromUrl) {
                localStorage.setItem("token", tokenFromUrl);
            }
        }

        // Only fetch if we're not already loading auth state"""

if old_levels_target in levels_content:
    levels_content = levels_content.replace(old_levels_target, new_levels_replacement, 1)
    with open(levels_path, "w", encoding="utf-8") as f:
        f.write(levels_content)
    print("Updated levels.js successfully!")
else:
    print("Warning: old_levels_target not found in levels.js")

# 2. Update src/pages/login.js
login_path = os.path.join(WORKSPACE, "src", "pages", "login.js")
with open(login_path, "r", encoding="utf-8") as f:
    login_content = f.read()

old_login_target = """                toast.success(response.data.message);
                setIsLoggedIn(true);
                router.push("/levels");"""

new_login_replacement = """                if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                }
                toast.success(response.data.message);
                setIsLoggedIn(true);
                router.push("/levels");"""

if old_login_target in login_content:
    login_content = login_content.replace(old_login_target, new_login_replacement, 1)
    with open(login_path, "w", encoding="utf-8") as f:
        f.write(login_content)
    print("Updated login.js successfully!")
else:
    print("Warning: old_login_target not found in login.js")

# 3. Update src/components/Navbar/nav.js
nav_path = os.path.join(WORKSPACE, "src", "components", "Navbar", "nav.js")
with open(nav_path, "r", encoding="utf-8") as f:
    nav_content = f.read()

old_nav_target = """                console.log("entered");
                setIsLoggedIn(false);
                setUser(null);
                setToggleDropDown(false);"""

new_nav_replacement = """                console.log("entered");
                if (typeof window !== "undefined") {
                    localStorage.removeItem("token");
                }
                setIsLoggedIn(false);
                setUser(null);
                setToggleDropDown(false);"""

if old_nav_target in nav_content:
    nav_content = nav_content.replace(old_nav_target, new_nav_replacement, 1)
    with open(nav_path, "w", encoding="utf-8") as f:
        f.write(nav_content)
    print("Updated nav.js successfully!")
else:
    print("Warning: old_nav_target not found in nav.js")

# 4. Update src/pages/question.js
question_path = os.path.join(WORKSPACE, "src", "pages", "question.js")
with open(question_path, "r", encoding="utf-8") as f:
    q_content = f.read()

old_q_target = """        const config = {
            credentials: "include",
        };"""

new_q_replacement = """        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const config = {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        };"""

if old_q_target in q_content:
    q_content = q_content.replace(old_q_target, new_q_replacement, 1)
    with open(question_path, "w", encoding="utf-8") as f:
        f.write(q_content)
    print("Updated question.js successfully!")
else:
    print("Warning: old_q_target not found in question.js")

