const { sequelize } = require("./config/db");
const { QueryTypes } = require("sequelize");

async function checkSlugs() {
  try {
    const slugs = await sequelize.query("SELECT DISTINCT tac_module_id FROM t_approval_channel", {
      type: QueryTypes.SELECT
    });
    console.log(JSON.stringify(slugs, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSlugs();
