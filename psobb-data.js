var json_tech_data;
var json_monster_data;
try{
    const tech_data_response = await fetch("technique_data.json");
    const monster_data_response = await fetch("e1_monster_data.json");
    if (!tech_data_response.ok || !monster_data_response.ok){
        throw new Error(`Technique Data Status: ${tech_data_response.status}\nMonster Data Status: ${monster_data_response.status} `);
    }
    json_tech_data = await tech_data_response.json();
    json_monster_data = await monster_data_response.json();
} catch(error){
    console.error(error.message);
}

export var techniques_info = json_tech_data["technique_data"];
export var class_boosts = json_tech_data["class_boosts"];
export var weapon_boosts = json_tech_data["weapon_boosts"];
export var frame_boosts = json_tech_data["frame_boosts"];
export var barrier_boosts = json_tech_data["barrier_boosts"];
export var episode1_monster_data = json_monster_data;