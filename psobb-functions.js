import {techniques_info, class_boosts, weapon_boosts, frame_boosts, barrier_boosts, episode1_monster_data} from "/psobb-data.js";


function get_technique_power_per_level(technique_name, technique_level){
    if (technique_level <= 15) {
        return techniques_info[technique_name]["base15"] + techniques_info[technique_name]["growth15"] * (technique_level - 1);
    } else {
        return techniques_info[technique_name]["base30"] + techniques_info[technique_name]["growth30"] * (technique_level - 1);
    }
}

function get_technique_cost_per_level(technique_name, technique_level){
    return Math.floor(techniques_info[technique_name]["cost_base"] + techniques_info[technique_name]["cost_growth"] * (technique_level - 1));
}

function get_boost_if_defined(boost_type, player_data, technique_name){
    return (boost_type[player_data][technique_name] === undefined) ? 0 : boost_type[player_data][technique_name];
}

function get_damage_per_hit(player_mst, technique_base_power, class_boost, weapon_boost, frame_boost, barrier_boost, monsters_data, monster, technique_attr_res){
    return Math.round((parseInt(player_mst) + technique_base_power) * 0.2 * (1 + class_boost + weapon_boost + frame_boost + barrier_boost) * (100 - monsters_data[monster][technique_attr_res]) / 100);
}

function get_battle_data(technique_name, tech_level, mst_value, player_class, player_weapon, player_frame, player_barrier, player_difficulty, player_party_type, experience_boost){
    let technique_level = parseInt(tech_level);
    let player_mst = parseInt(mst_value);
    let monsters = [];
    let technique_base_power = get_technique_power_per_level(technique_name, technique_level);
    let technique_cost = get_technique_cost_per_level(technique_name, technique_level);
    let class_boost = get_boost_if_defined(class_boosts, player_class, technique_name);
    let weapon_boost = get_boost_if_defined(weapon_boosts, player_weapon, technique_name);
    let frame_boost = get_boost_if_defined(frame_boosts, player_frame, technique_name);
    let barrier_boost = get_boost_if_defined(barrier_boosts, player_barrier, technique_name);
    let monsters_data = episode1_monster_data[player_difficulty][player_party_type];
    let technique_attr_res = techniques_info[technique_name]["resisted_by"];

    for (let monster in monsters_data){
        let xp_gained = monsters_data[monster]["XP"] * (1.0 + (experience_boost/100));
        let damage_done = get_damage_per_hit(player_mst, technique_base_power, class_boost, weapon_boost, frame_boost, barrier_boost, monsters_data, monster, technique_attr_res);
        let hits_to_kill = (damage_done == 0) ? Infinity : Math.ceil(monsters_data[monster]["HP"] / damage_done);
        let xp_each_cast = (hits_to_kill == Infinity) ? 0 : (xp_gained / hits_to_kill).toFixed(2); 
        let cost_each_kill = (hits_to_kill == Infinity) ? Infinity : (technique_cost * hits_to_kill).toFixed(2);
        monsters.push({monster_name:monster, monster_hp:monsters_data[monster]["HP"], damage_per_cast:damage_done, hits_required:hits_to_kill, experience_per_kill:xp_gained, experience_per_cast:xp_each_cast, tpcost_per_kill:cost_each_kill});
    }
    return monsters;
}


function populate_form(){
    let tech_name_options = document.getElementById("technique-name");
    let class_options = document.getElementById("player-class");
    let weapon_options = document.getElementById("player-weapon");
    let frame_options = document.getElementById("player-frame");
    let barrier_options = document.getElementById("player-barrier");
    let difficulty_options = document.getElementById("player-difficulty");
    let party_options = document.getElementById("party-type");

    document.getElementById("technique-level").value = 1;
    document.getElementById("mst-value").value = 10;
    document.getElementById("experience-boost").value = 0;
    // TODO: Explore a cleaner way to do this
    for (let tech in techniques_info){
        tech_name_options.innerHTML += `<option value=${tech}>${tech}</option><br>`;
    }

    for (let classes in class_boosts){
        class_options.innerHTML += `<option value=${classes}>${classes}</option><br>`;
    }

    for (let weapon in weapon_boosts){
        weapon_options.innerHTML += `<option value=${weapon}>${weapon}</option><br>`;
    }

    for (let frame in frame_boosts){
        frame_options.innerHTML += `<option value=${frame}>${frame}</option><br>`;
    }

    for (let barrier in barrier_boosts){
        barrier_options.innerHTML += `<option value=${barrier}>${barrier}</option><br>`;
    }

    for (let difficulty in episode1_monster_data){
        difficulty_options.innerHTML += `<option value=${difficulty}>${difficulty}</option><br>`;
    }

    for (let party in episode1_monster_data["Normal"]){
        party_options.innerHTML += `<option value=${party}>${party}</option><br>`;
    }

    document.getElementById("calculate-submit").addEventListener("click", calculate_damage)
}

function calculate_damage(){
    let tech_name = document.getElementById("technique-name").value;
    let player_class = document.getElementById("player-class").value;
    let player_weapon = document.getElementById("player-weapon").value;
    let player_frame = document.getElementById("player-frame").value;
    let player_barrier = document.getElementById("player-barrier").value;
    let player_difficulty = document.getElementById("player-difficulty").value;
    let player_party = document.getElementById("party-type").value;

    let tech_level = document.getElementById("technique-level");
    tech_level.value = (tech_level.value < 1) ? 1 : (tech_level.value > 30) ? 30 : tech_level.value;

    let mst_value = document.getElementById("mst-value");
    mst_value.value = (mst_value.value < 0) ? 0 : mst_value.value;

    let xp_boost = document.getElementById("experience-boost");
    xp_boost.value = (xp_boost.value < 0) ? 0 : xp_boost.value;
    
    let monster_list = get_battle_data(tech_name, tech_level.value, mst_value.value, player_class, player_weapon, player_frame, player_barrier, player_difficulty, player_party, xp_boost.value);
    display_results(monster_list);
}

function display_results(monster_list){
    let results_table = document.getElementById("results-table");
    results_table.innerHTML = "<tr><th>Monster Name</th><th>HP</th><th>XP</th><th>Damage per Cast</th><th>Hits to Kill</th><th>TP Cost per Kill</th><th>XP per Cast</th></tr>";
    for (let iteration = 0; iteration < monster_list.length; iteration++){
        let monster = monster_list[iteration];
        results_table.innerHTML += `<tr><td>${monster.monster_name}</td><br>` +
                                   `<td>${monster.monster_hp}</td><br>` +
                                   `<td>${monster.experience_per_kill}</td><br>` +
                                   `<td>${monster.damage_per_cast}</td><br>` +
                                   `<td>${monster.hits_required}</td><br>` +
                                   `<td>${monster.tpcost_per_kill}</td><br>` +
                                   `<td>${monster.experience_per_cast}</td><br></tr>`
    }
}

if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", populate_form);
} else {
    populate_form();
}
