#!/bin/bash

# Wildbook Management Script
# Usage: ./manage.sh [command] [options]

usage() {
    echo "Wildbook Management Script"
    echo ""
    echo "Commands:"
    echo "  createsuperuser [username] [password]   # Create admin user"
    echo "  createindices                          # Create OpenSearch indices"
    echo ""
    echo "Examples:"
    echo "  ./manage.sh createsuperuser                    # Interactive prompts"
    echo "  ./manage.sh createsuperuser admin mypassword   # Direct arguments"
    echo "  ./manage.sh createindices                      # Create search indices"
}

check_docker() {
    if ! docker compose ps wildbook | grep -q "Up"; then
        echo "❌ Wildbook container is not running. Please start it first:"
        echo "   docker compose up -d"
        exit 1
    fi
}

createsuperuser() {
    echo "Creating superuser (admin)..."
    
    local username="$1"
    local password="$2"
    
    # Interactive prompts if not provided
    if [[ -z "$username" ]]; then
        read -p "Username: " username
        username=${username:-"admin"}
    fi
    
    if [[ -z "$password" ]]; then
        read -s -p "Password: " password
        echo
        password=${password:-"admin123"}
    fi
    
    echo "Creating user '$username'..."
    
    # Create temporary JSP for user creation
    local temp_jsp="create_superuser_$(date +%s).jsp"
    
    cat > "/tmp/$temp_jsp" << EOF
<%@ page import="org.ecocean.servlet.ServletUtilities,org.ecocean.*,org.ecocean.shepherd.core.Shepherd" %>
<%
String username = "$username";
String password = "$password";
String fullName = "Administrator";
String email = "$username@wildbook.local";
String affiliation = "Wildbook Administrator";
String context = "context0";

Shepherd myShepherd = new Shepherd(context);
myShepherd.setAction("CreateSuperUser");

try {
    myShepherd.beginDBTransaction();
    
    if (myShepherd.getUser(username) == null) {
        String salt = ServletUtilities.getSalt().toHex();
        String hashedPassword = ServletUtilities.hashAndSaltPassword(password, salt);
        
        User newUser = new User(username, hashedPassword, salt);
        newUser.setFullName(fullName);
        newUser.setEmailAddress(email);
        newUser.setAffiliation(affiliation);
        newUser.setReceiveEmails(true);
        newUser.setAcceptedUserAgreement(true);
        
        myShepherd.getPM().makePersistent(newUser);
        myShepherd.commitDBTransaction();
        
        out.print("SUCCESS");
    } else {
        out.print("ERROR:User already exists");
    }
} catch (Exception e) {
    myShepherd.rollbackDBTransaction();
    out.print("ERROR:" + e.getMessage());
} finally {
    myShepherd.closeDBTransaction();
}
%>
EOF

    # Copy to container and execute
    docker compose cp "/tmp/$temp_jsp" wildbook:/usr/local/tomcat/webapps/ROOT/
    local result=$(curl -s "http://localhost:8080/$temp_jsp")
    
    # Clean up
    rm "/tmp/$temp_jsp"
    docker compose exec wildbook rm "/usr/local/tomcat/webapps/ROOT/$temp_jsp" 2>/dev/null
    
    if [[ $result == "SUCCESS" ]]; then
        echo "✅ Superuser '$username' created successfully!"
        
        # Add admin role
        echo "Adding admin role..."
        docker compose exec db psql -U wildbook -d wildbook -c "
            INSERT INTO \"USER_ROLES\" (\"USERNAME\", \"ROLE_NAME\", \"CONTEXT\") 
            VALUES ('$username', 'admin', 'context0');" >/dev/null 2>&1
        echo "✅ Admin role added!"
        
        echo ""
        echo "Login credentials:"
        echo "Username: $username"
        echo "Password: $password"
        echo "URL: http://localhost:8080/react/login"
    else
        echo "❌ Error creating superuser: $result"
        return 1
    fi
}

createindices() {
    echo "Creating OpenSearch indices..."
    
    # Check if OpenSearch is running
    if ! docker compose ps opensearch | grep -q "Up"; then
        echo "❌ OpenSearch container is not running. Please start it first:"
        echo "   docker compose up -d"
        exit 1
    fi
    
    # Define indices with their mappings
    local indices=(
        "encounter"
        "individual" 
        "occurrence"
        "annotation"
        "media_asset"
    )
    
    local base_mapping='{
        "settings": {
            "analysis": {
                "normalizer": {
                    "wildbook_keyword_normalizer": {
                        "type": "custom",
                        "char_filter": [],
                        "filter": ["lowercase", "asciifolding"]
                    }
                }
            }
        },
        "mappings": {
            "properties": {
                "version": {"type": "long"},
                "id": {"type": "keyword"},
                "viewUsers": {"type": "keyword"},
                "editUsers": {"type": "keyword"}
            }
        }
    }'
    
    for index in "${indices[@]}"; do
        echo -n "Creating index '$index'... "
        
        # Check if index already exists
        local exists=$(docker compose exec opensearch curl -s -o /dev/null -w "%{http_code}" "localhost:9200/$index")
        
        if [[ $exists == "200" ]]; then
            echo "already exists ✓"
            continue
        fi
        
        # Create the index
        local result=$(docker compose exec opensearch curl -s -X PUT "localhost:9200/$index" \
            -H "Content-Type: application/json" \
            -d "$base_mapping")
        
        if echo "$result" | grep -q '"acknowledged":true'; then
            echo "created ✅"
        else
            echo "failed ❌"
            echo "Error: $result"
        fi
    done
    
    echo ""
    echo "Index creation complete! Current indices:"
    docker compose exec opensearch curl -s "localhost:9200/_cat/indices?v" | grep -E "index|encounter|individual|occurrence|annotation|media_asset"
}

# Main command handling
case "$1" in
    "createsuperuser")
        check_docker
        createsuperuser "$2" "$3"
        ;;
    "createindices")
        createindices
        ;;
    "help"|"-h"|"--help"|"")
        usage
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        usage
        exit 1
        ;;
esac