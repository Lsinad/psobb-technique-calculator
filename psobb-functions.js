import {techniques_info, class_boosts, weapon_boosts, frame_boosts, barrier_boosts, monster_data} from "/psobb-data.js";

var config = { 
    monsters:[],
    sorted_by:"null",
};

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
    return Math.floor((parseInt(player_mst) + technique_base_power) * 0.2 * (1 + class_boost + weapon_boost + frame_boost + barrier_boost) * (100 - monsters_data[monster][technique_attr_res]) / 100);
}

function get_battle_data(technique_name, tech_level, mst_value, player_class, player_weapon, player_frame, player_barrier, player_episode, player_difficulty, player_party_type, experience_boost){
    let technique_level = parseInt(tech_level);
    let player_mst = parseInt(mst_value);
    let technique_base_power = get_technique_power_per_level(technique_name, technique_level);
    let technique_cost = get_technique_cost_per_level(technique_name, technique_level);
    let class_boost = get_boost_if_defined(class_boosts, player_class, technique_name);
    let weapon_boost = get_boost_if_defined(weapon_boosts, player_weapon, technique_name);
    let frame_boost = get_boost_if_defined(frame_boosts, player_frame, technique_name);
    let barrier_boost = get_boost_if_defined(barrier_boosts, player_barrier, technique_name);
    let monsters_data = monster_data[player_episode][player_difficulty][player_party_type];
    let technique_attr_res = techniques_info[technique_name]["resisted_by"];
    config.monsters = [];

    for (let monster in monsters_data){
        let xp_gained = Math.floor(monsters_data[monster]["XP"] * (1.0 + (experience_boost/100)));
        let damage_done = get_damage_per_hit(player_mst, technique_base_power, class_boost, weapon_boost, frame_boost, barrier_boost, monsters_data, monster, technique_attr_res);
        let hits_to_kill = (damage_done == 0) ? Infinity : Math.ceil(monsters_data[monster]["HP"] / damage_done);
        let xp_each_cast = (hits_to_kill == Infinity) ? 0 : (xp_gained / hits_to_kill).toFixed(2); 
        let cost_each_kill = (hits_to_kill == Infinity) ? Infinity : (technique_cost * hits_to_kill).toFixed(2);
        config.monsters.push({monster_name:monster, monster_hp:monsters_data[monster]["HP"], damage_per_cast:damage_done, hits_required:hits_to_kill, experience_per_kill:xp_gained, experience_per_cast:xp_each_cast, tpcost_per_kill:cost_each_kill});
    }
    config.sorted_by = "null";
    return config.monsters;
}

function populate_form(){
    let tech_name_options = document.getElementById("technique-name");
    let class_options = document.getElementById("player-class");
    let weapon_options = document.getElementById("player-weapon");
    let frame_options = document.getElementById("player-frame");
    let barrier_options = document.getElementById("player-barrier");
    let episode_options = document.getElementById("player-episode");
    let difficulty_options = document.getElementById("player-difficulty");
    let party_options = document.getElementById("party-type");

    document.getElementById("technique-level").value = 1;
    document.getElementById("mst-value").value = 10;
    document.getElementById("experience-boost").value = 0;

    // TODO: Explore a cleaner way to do this
    for (let tech in techniques_info){
        tech_name_options.innerHTML += `<option value=\"${tech}\">${tech}</option><br>`;
    }

    for (let classes in class_boosts){
        class_options.innerHTML += `<option value=\"${classes}\">${classes}</option><br>`;
    }

    for (let weapon in weapon_boosts){
        weapon_options.innerHTML += `<option value=\"${weapon}\">${weapon}</option><br>`;
    }

    for (let frame in frame_boosts){
        frame_options.innerHTML += `<option value=\"${frame}\">${frame}</option><br>`;
    }

    for (let barrier in barrier_boosts){
        barrier_options.innerHTML += `<option value=\"${barrier}\">${barrier}</option><br>`;
    }

    for (let episode in monster_data){
        episode_options.innerHTML += `<option value=\"${episode}\">${episode}</option><br>`;
    }

    for (let difficulty in monster_data["Episode 1"]){
        difficulty_options.innerHTML += `<option value=\"${difficulty}\">${difficulty}</option><br>`;
    }

    for (let party in monster_data["Episode 1"]["Normal"]){
        party_options.innerHTML += `<option value=\"${party}\">${party}</option><br>`;
    }

    document.getElementById("calculate-submit").addEventListener("click", calculate_damage);
    document.getElementById("technique-level").addEventListener("change", (evnt) => {
        if (evnt.target.value > 30) { evnt.target.value = 30; }
        if (evnt.target.value < 1) { evnt.target.value = 1; }
    });
    document.getElementById("mst-value").addEventListener("change", (evnt) => {
        if (evnt.target.value < 0) { evnt.target.value = 0; }
    });
    document.getElementById("experience-boost").addEventListener("change", (evnt) =>{
        if (evnt.target.value < 0) { evnt.target.value = 0; }
    });
}

function calculate_damage(){
    let tech_name = document.getElementById("technique-name").value;
    let player_class = document.getElementById("player-class").value;
    let player_weapon = document.getElementById("player-weapon").value;
    let player_frame = document.getElementById("player-frame").value;
    let player_barrier = document.getElementById("player-barrier").value;
    let player_episode = document.getElementById("player-episode").value;
    let player_difficulty = document.getElementById("player-difficulty").value;
    let player_party = document.getElementById("party-type").value;

    let tech_level = document.getElementById("technique-level").value;

    let mst_value = document.getElementById("mst-value").value;

    let xp_boost = document.getElementById("experience-boost").value;
    
    let monster_list = get_battle_data(tech_name, tech_level, mst_value, player_class, player_weapon, player_frame, player_barrier, player_episode, player_difficulty, player_party, xp_boost);
    display_results(monster_list);
}

function display_results(monster_list){
    let results_table = document.getElementById("results-table");

    results_table.innerHTML = "<tr><th id=\"name-sort\">Monster Name<img src=\"/sort-icon.svg\"></th>" +
                              "<th id=\"hp-sort\">HP<img src=\"/sort-icon.svg\"></th>" +
                              "<th id=\"xp-sort\">XP<img src=\"/sort-icon.svg\"></th>" +
                              "<th id=\"dpc-sort\">Damage per Cast<img src=\"/sort-icon.svg\"></th>" +
                              "<th id=\"hit-sort\">Hits to Kill<img src=\"/sort-icon.svg\"></th>" + 
                              "<th id=\"cost-sort\">TP Cost per Kill<img src=\"/sort-icon.svg\"></th>" +
                              "<th id=\"xpp-sort\">XP per Cast<img src=\"/sort-icon.svg\"></th></tr>";

    for (let iteration = 0; iteration < monster_list.length; iteration++){
        let monster = monster_list[iteration];
        results_table.innerHTML += `<tr><td>${monster.monster_name}</td>` +
                                   `<td>${monster.monster_hp}</td>` +
                                   `<td>${monster.experience_per_kill}</td>` +
                                   `<td>${monster.damage_per_cast}</td>` +
                                   `<td>${monster.hits_required}</td>` +
                                   `<td>${monster.tpcost_per_kill}</td>` +
                                   `<td>${monster.experience_per_cast}</td></tr>`;
    }

    document.getElementById("name-sort").addEventListener("click", function(){
        sort_table("monster_name");
    });
    document.getElementById("hp-sort").addEventListener("click", function(){
        sort_table("monster_hp");
    });
    document.getElementById("xp-sort").addEventListener("click", function(){
        sort_table("experience_per_kill");
    });
    document.getElementById("dpc-sort").addEventListener("click", function(){
        sort_table("damage_per_cast");
    });
    document.getElementById("hit-sort").addEventListener("click", function(){
        sort_table("hits_required");
    });
    document.getElementById("cost-sort").addEventListener("click", function(){
        sort_table("tpcost_per_kill");
    });
    document.getElementById("xpp-sort").addEventListener("click", function(){
        sort_table("experience_per_cast");
    });
}

function compare_monster_names(monster1, monster2){
    if (monster1.monster_name > monster2.monster_name){
        return 1;
    }
    if (monster1.monster_name < monster2.monster_name){
        return -1;
    }
    return 0;
}

function sort_table(sort_selected){
    if (config.sorted_by == sort_selected){
        config.monsters.reverse();
    } else if (sort_selected == "monster_name"){
        config.monsters.sort(compare_monster_names)
    } else {
        config.monsters.sort((monster1, monster2) => monster2[sort_selected] - monster1[sort_selected]);
    } 
    config.sorted_by = sort_selected
    display_results(config.monsters)
}

if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", populate_form);
} else {
    populate_form();
}
