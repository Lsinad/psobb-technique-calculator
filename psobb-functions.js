import {techniques_info, class_boosts, weapon_boosts, frame_boosts, barrier_boosts, episode1_monster_data} from "/psobb-data.js";

function get_technique_power_per_level(technique_name, technique_level){
    if (technique_level <= 15) {
        return techniques_info[technique_name]["base15"] + techniques_info[technique_name]["growth15"] * (technique_level - 1);
    } else {
        return techniques_info[technique_name]["base30"] + techniques_info[technique_name]["growth30"] * (technique_level - 1);
    }
}

function get_technique_cost_per_level(technique_name, technique_level) {
    return techniques_info[technique_name]["cost_base"] + techniques_info[technique_name]["cost_growth"] * (technique_level - 1);
}

function get_boost_if_defined(boost_type, player_data, technique_name){
    return (boost_type[player_data][technique_name] === undefined) ? 0 : boost[boost_type][technique_name];
}

function get_battle_data(technique_name, technique_level, player_mst, player_class="Class", player_weapon="Weapon", player_frame="Frame", player_barrier="Barrier", player_difficulty="Normal", player_party_type="normal", experience_boost=0.0){
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
        let damage_done = Math.round((player_mst + technique_base_power) * 0.2 * (1 + class_boost + weapon_boost + frame_boost + barrier_boost) * (100 - monsters_data[monster][technique_attr_res]) / 100);
        let hits_to_kill = (damage_done == 0) ? Infinity : Math.ceil(monsters_data[monster]["HP"] / damage_done);
        let xp_each_cast = (hits_to_kill == Infinity) ? 0 : (xp_gained / hits_to_kill).toFixed(2); 
        let cost_each_kill = (hits_to_kill == Infinity) ? Infinity : (technique_cost * hits_to_kill).toFixed(2);
        monsters.push({monster_name:monster, damage_per_cast:damage_done, hits_required:hits_to_kill, experience_per_kill:xp_gained, experience_per_cast:xp_each_cast, tpcost_per_kill:cost_each_kill});
    }
    return monsters;
}

