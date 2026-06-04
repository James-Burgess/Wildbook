package org.ecocean.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.ServletException;

import org.ecocean.CommonConfiguration;
import org.ecocean.Encounter;
import org.ecocean.servlet.ServletUtilities;
import org.ecocean.shepherd.core.Shepherd;
import org.ecocean.User;
import org.ecocean.Util;
import org.json.JSONArray;
import org.json.JSONObject;

public class PublicHome extends ApiBase {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {
        String context = ServletUtilities.getContext(request);
        Shepherd myShepherd = new Shepherd(context);

        myShepherd.setAction("api.PublicHome");
        myShepherd.beginDBTransaction();

        JSONObject homepage = new JSONObject();

        try {
            homepage.put("numMarkedIndividuals", myShepherd.getNumMarkedIndividuals());
            homepage.put("numEncounters", myShepherd.getNumEncounters());

            List<User> allUsers = myShepherd.getAllUsers();
            int numUsers = Util.collectionSize(allUsers);
            homepage.put("numUsers", numUsers);

            int numUsersWithRoles = 0;
            for (User u : allUsers) {
                if (!myShepherd.getAllRolesForUser(u.getUsername()).isEmpty()) {
                    numUsersWithRoles++;
                }
            }
            homepage.put("numCitizenScientists", numUsersWithRoles - numUsers);
            homepage.put("numResearchVolunteers", numUsersWithRoles);

            User featuredUser = myShepherd.getRandomUserWithPhotoAndStatement();
            if (featuredUser != null) {
                JSONObject fea = new JSONObject();
                fea.put("username", featuredUser.getUsername());
                fea.put("fullName", Util.jsonNull(featuredUser.getFullName()));
                fea.put("affiliation", Util.jsonNull(featuredUser.getAffiliation()));
                fea.put("userStatement", Util.jsonNull(featuredUser.getUserStatement()));
                fea.put("imageURL", Util.jsonNull(
                    featuredUser.getUserImageURL(myShepherd.getContext())));
                homepage.put("featuredUser", fea);
            } else {
                homepage.put("featuredUser", JSONObject.NULL);
            }

            JSONArray latestEncs = new JSONArray();
            List<Encounter> recentEncs =
                myShepherd.getMostRecentIdentifiedEncountersByDate(3);
            if (recentEncs != null) {
                for (Encounter enc : recentEncs) {
                    JSONObject ej = new JSONObject();
                    ej.put("catalogNumber", enc.getCatalogNumber());
                    ej.put("displayName", Util.jsonNull(enc.getDisplayName()));
                    ej.put("date", Util.jsonNull(enc.getDate()));
                    ej.put("locationID", Util.jsonNull(enc.getLocationID()));
                    latestEncs.put(ej);
                }
            }
            homepage.put("latestEncounters", latestEncs);

            JSONArray spotters = new JSONArray();
            long startTime = System.currentTimeMillis()
                - (1000L * 60L * 60L * 24L * 30L);
            Map<String, Integer> spotterMap =
                myShepherd.getTopUsersSubmittingEncountersSinceTimeInDescendingOrder(
                    startTime);

            if (spotterMap != null) {
                int count = 0;
                Iterator<String> keys = spotterMap.keySet().iterator();
                Iterator<Integer> values = spotterMap.values().iterator();
                while (keys.hasNext() && values.hasNext() && count < 3) {
                    String username = keys.next();
                    int numEncs = values.next();
                    if ("siowamteam".equals(username) || "admin".equals(username)
                        || "tomcat".equals(username)) continue;
                    User spotter = myShepherd.getUser(username);
                    if (spotter == null) continue;
                    JSONObject sj = new JSONObject();
                    sj.put("username", username);
                    sj.put("numEncounters", numEncs);
                    sj.put("affiliation", Util.jsonNull(spotter.getAffiliation()));
                    sj.put("imageURL", Util.jsonNull(
                        spotter.getUserImageURL(myShepherd.getContext())));
                    spotters.put(sj);
                    count++;
                }
            }
            homepage.put("topSpotters", spotters);

            response.setStatus(200);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(500);
        } finally {
            myShepherd.rollbackDBTransaction();
            myShepherd.closeDBTransaction();
        }

        response.setHeader("Content-Type", "application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(homepage.toString());
    }
}
