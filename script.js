const puppeteer = require("puppeteer");
let { id, pass } = require("./secret");
let dataFile = require("./data");

async function main() {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"]
        });
        const pages = await browser.pages();
        const tab = pages[0];

        console.log("Navigating to Internshala login page");
        await tab.goto("https://internshala.com/");

        const loginButtonSelector = ".login-cta";

        console.log("Waiting for login button");
        await tab.waitForSelector(loginButtonSelector, { visible: true });

        console.log("Clicking login button");
        await tab.click(loginButtonSelector);

        console.log("Waiting for email input field");
        await tab.waitForSelector("#modal_email", { visible: true });

        console.log("Entering email");
        await tab.type("#modal_email", id);

        console.log("Entering password");
        await tab.type("#modal_password", pass);

        console.log("Clicking login submit button");
        await tab.click("#modal_login_submit");

        console.log("Waiting for navigation to complete");
        await tab.waitForNavigation({ waitUntil: "networkidle2" });

        console.log("Waiting for profile dropdown toggle");
        await tab.waitForSelector(".nav-link.dropdown-toggle.profile_container .is_icon_header.ic-24-filled-down-arrow", { visible: true });

        console.log("Clicking profile dropdown toggle");
        await tab.click(".nav-link.dropdown-toggle.profile_container .is_icon_header.ic-24-filled-down-arrow");

        console.log("Waiting for profile options");
        await tab.waitForSelector(".profile_options a", { visible: true });

        const profile_options = await tab.$$(".profile_options a");
        let app_urls = [];

        console.log("Collecting application URLs");
        for (let i = 0; i < profile_options.length; i++) {
            let url = await tab.evaluate(function (ele) {
                return ele.getAttribute("href");
            }, profile_options[i]);
            app_urls.push(url);
        }

        console.log("Navigating to application URL");
        await tab.goto("https://internshala.com" + app_urls[1]);

        console.log("Waiting for graduation tab");
        await tab.waitForSelector("#graduation-tab .ic-16-plus", { visible: true });
        await tab.click("#graduation-tab .ic-16-plus");
        await graduation(dataFile[0]);

        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log("Clicking next button");
        await tab.waitForSelector(".next-button", { visible: true });
        await tab.click(".next-button");

        console.log("Entering training details");
        await training(dataFile[0]);

        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log("Clicking next button");
        await tab.waitForSelector(".next-button", { visible: true });
        await tab.click(".next-button");

        console.log("Skipping additional steps");
        await tab.waitForSelector(".btn.btn-secondary.skip.skip-button", { visible: true });
        await tab.click(".btn.btn-secondary.skip.skip-button");

        console.log("Entering work sample details");
        await workSample(dataFile[0]);

        await new Promise(resolve => setTimeout(resolve, 1000));
        await tab.waitForSelector("#save_work_samples", { visible: true });
        await tab.click("#save_work_samples");

        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Navigating to application section");
        await application(dataFile[0]);

        console.log("Closing browser");
        await browser.close();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function graduation(data) {
    try {
        console.log("Filling out graduation details");
        await tab.waitForSelector("#degree_completion_status_pursuing", { visible: true });
        await tab.click("#degree_completion_status_pursuing");

        await tab.waitForSelector("#college", { visible: true });
        await tab.type("#college", data["College"]);

        await tab.waitForSelector("#start_year_chosen", { visible: true });
        await tab.click("#start_year_chosen");
        await tab.waitForSelector(".active-result[data-option-array-index='5']", { visible: true });
        await tab.click(".active-result[data-option-array-index='5']");

        await tab.waitForSelector("#end_year_chosen", { visible: true });
        await tab.click('#end_year_chosen');
        await tab.waitForSelector("#end_year_chosen .active-result[data-option-array-index = '6']", { visible: true });
        await tab.click("#end_year_chosen .active-result[data-option-array-index = '6']");

        await tab.waitForSelector("#degree", { visible: true });
        await tab.type("#degree", data["Degree"]);

        await new Promise(resolve => setTimeout(resolve, 1000));
        await tab.waitForSelector("#stream", { visible: true });
        await tab.type("#stream", data["Stream"]);

        await new Promise(resolve => setTimeout(resolve, 1000));
        await tab.waitForSelector("#performance-college", { visible: true });
        await tab.type("#performance-college", data["Percentage"]);

        await new Promise(resolve => setTimeout(resolve, 1000));

        await tab.click("#college-submit");
    } catch (error) {
        console.error("An error occurred in graduation function:", error);
    }
}

async function training(data) {
    try {
        console.log("Filling out training details");
        await tab.waitForSelector(".experiences-tabs[data-target='#training-modal'] .ic-16-plus", { visible: true });
        await tab.click(".experiences-tabs[data-target='#training-modal'] .ic-16-plus");

        await tab.waitForSelector("#other_experiences_course", { visible: true });
        await tab.type("#other_experiences_course", data["Training"]);

        await new Promise(resolve => setTimeout(resolve, 1000));

        await tab.waitForSelector("#other_experiences_organization", { visible: true });
        await tab.type("#other_experiences_organization", data["Organization"]);

        await new Promise(resolve => setTimeout(resolve, 1000));

        await tab.click("#other_experiences_location_type_label");
        await tab.click("#other_experiences_start_date");

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await tab.waitForSelector(".ui-state-default[href='#']", { visible: true });
        let date = await tab.$$(".ui-state-default[href='#']");
        await date[0].click();
        await tab.click("#other_experiences_is_on_going");

        await tab.waitForSelector("#other_experiences_training_description", { visible: true });
        await tab.type("#other_experiences_training_description", data["description"]);

        await new Promise(resolve => setTimeout(resolve, 2000));

        await tab.click("#training-submit");
    } catch (error) {
        console.error("An error occurred in training function:", error);
    }
}

async function workSample(data) {
    try {
        console.log("Filling out work sample details");
        await tab.waitForSelector("#other_portfolio_link", { visible: true });
        await tab.type("#other_portfolio_link", data["link"]);
    } catch (error) {
        console.error("An error occurred in workSample function:", error);
    }
}

async function application(data) {
    try {
        console.log("Navigating to application section");
        await tab.goto("https://internshala.com/the-grand-summer-internship-fair");

        console.log("Waiting for view internship button");
        await tab.waitForSelector(".btn.btn-primary.campaign-btn.view_internship", { visible: true });
        await tab.click(".btn.btn-primary.campaign-btn.view_internship");

        await new Promise(resolve => setTimeout(resolve, 2000));
        await tab.waitForSelector(".view_detail_button", { visible: true });
        let details = await tab.$$(".view_detail_button");
        let detailUrl = [];
        for (let i = 0; i < 3; i++) {
            let url = await tab.evaluate(function (ele) {
                return ele.getAttribute("href");
            }, details[i]);
            detailUrl.push(url);
        }

        for (let i of detailUrl) {
            await apply(i, data);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error("An error occurred in application function:", error);
    }
}

async function apply(url, data) {
    try {
        console.log("Applying to internship at URL:", url);
        await tab.goto("https://internshala.com" + url);

        await tab.waitForSelector(".btn.btn-large", { visible: true });
        await tab.click(".btn.btn-large");

        await tab.waitForSelector("#application_button", { visible: true });
        await tab.click("#application_button");

        await tab.waitForSelector(".textarea.form-control", { visible: true });
        let ans = await tab.$$(".textarea.form-control");

        for (let i = 0; i < ans.length; i++) {
            if (i == 0) {
                await ans[i].type(data["hiringReason"]);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else if (i == 1) {
                await ans[i].type(data["availability"]);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                await ans[i].type(data["rating"]);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        await tab.click(".submit_button_container");
    } catch (error) {
        console.error("An error occurred in apply function:", error);
    }
}

main();
