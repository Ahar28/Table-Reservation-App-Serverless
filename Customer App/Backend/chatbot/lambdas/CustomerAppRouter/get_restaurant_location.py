import dialogstate_utils as dialog
from prompts_responses import Prompts, Responses
from datetime import date, timedelta, datetime
import json
import random as random
import restaurant_system

def handler(intent_request, client):
    intent = dialog.get_intent(intent_request)
    active_contexts = dialog.get_active_contexts(intent_request)
    session_attributes = dialog.get_session_attributes(intent_request)
    prompts = Prompts('get_location')
    responses = Responses('get_location')
    restaurant_name = dialog.get_slot('RestaurantName', intent)
    user_id, user_email = dialog.get_from(intent_request)
    
    if restaurant_name:
        dialog.set_session_attribute(intent_request, 'restaurant_name', restaurant_name)
        session_attributes = dialog.get_session_attributes(intent_request)
        
    if restaurant_name and not intent['state'] == 'Fulfilled':
        does_restaurant_match = restaurant_system.check_restaurant_name(restaurant_name, client)
        
        if not does_restaurant_match:
            prompt = prompts.get('InvalidRestaurantNamePrompt')
            return dialog.elicit_slot(
                'RestaurantName', active_contexts, session_attributes, intent,
                [{'contentType': 'PlainText', 'content': prompt}]
                )
        else:
            restaurant_location = restaurant_system.get_restaurant_location(restaurant_name, client)
            response = responses.get('Fulfilment', get_restaurant_location=restaurant_location)
            return dialog.elicit_intent(active_contexts, 
                            session_attributes, intent, 
                            [{'contentType': 'PlainText', 'content': response}])
 
    return dialog.delegate(active_contexts, session_attributes, intent)                    
